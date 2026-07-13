using System.Text;
using System.Text.Json;
using pumpkin_api.Services;
using pumpkin_net_models.Models;

const int MaximumCosmosItemBytes = 1_800_000;
const string ContactSlug = "contact";
const string ContactInstanceId = "/contact#form-1";

var arguments = ParseArguments(args);
if (!arguments.TryGetValue("pages", out var pagesPath) ||
    !arguments.TryGetValue("definitions", out var definitionsPath) ||
    !arguments.TryGetValue("existing-slugs", out var existingSlugsPath) ||
    !arguments.TryGetValue("expected-tenant", out var expectedTenant))
{
    Console.Error.WriteLine("Usage: page-contract-validator --pages <json> --definitions <json> --existing-slugs <json> --expected-tenant <tenant> [--expected-pages <n>] [--expected-remaining <n>] [--redirect-application create-with-page|update-pending-pages] [--tenant-redirect-plan <json>]");
    return 2;
}

var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
options.Converters.Add(new HtmlBlockBaseJsonConverter());

var pagesJson = await File.ReadAllTextAsync(pagesPath);
var definitionsJson = await File.ReadAllTextAsync(definitionsPath);
var pages = JsonSerializer.Deserialize<List<Page>>(pagesJson, options) ?? new List<Page>();
var definitions = JsonSerializer.Deserialize<List<FormDefinition>>(definitionsJson, options) ?? new List<FormDefinition>();
var existingSlugs = JsonSerializer.Deserialize<List<string>>(await File.ReadAllTextAsync(existingSlugsPath), options)
    ?.ToHashSet(StringComparer.Ordinal) ?? new HashSet<string>(StringComparer.Ordinal);
using var pagesDocument = JsonDocument.Parse(pagesJson);

var expectedPageCount = ReadInteger(arguments, "expected-pages", pages.Count);
var expectedRemainingCount = ReadInteger(arguments, "expected-remaining", pages.Count - existingSlugs.Count);
var expectedRedirectCount = ReadInteger(arguments, "expected-redirects", 3);
var redirectApplication = arguments.GetValueOrDefault("redirect-application", "create-with-page");
var tenantRedirectPlanKeys = arguments.TryGetValue("tenant-redirect-plan", out var tenantRedirectPlanPath)
    ? await ReadTenantRedirectPlanKeysAsync(tenantRedirectPlanPath, expectedTenant)
    : new HashSet<string>(StringComparer.Ordinal);
var globalIssues = new List<ContractIssue>();
var rows = new List<PageContractResult>();
var definitionByKey = definitions
    .Where(definition => !string.IsNullOrWhiteSpace(definition.FormKey))
    .GroupBy(definition => definition.FormKey, StringComparer.Ordinal)
    .ToDictionary(group => group.Key, group => group.ToList(), StringComparer.Ordinal);

AddDuplicateIssues(pages.Select(page => page.PageId), "page.id.duplicate", "Duplicate page ID", globalIssues);
AddDuplicateIssues(pages.Select(page => page.PageSlug), "page.slug.duplicate", "Duplicate page slug", globalIssues);
AddDuplicateIssues(definitions.Select(definition => definition.FormKey), "form.key.duplicate", "Duplicate global FormDefinition key", globalIssues);

if (redirectApplication is not ("create-with-page" or "update-pending-pages"))
{
    globalIssues.Add(new("error", "redirect.application", $"Unsupported redirect application mode '{redirectApplication}'.", "redirectApplication"));
}

if (pages.Count != expectedPageCount)
{
    globalIssues.Add(new("error", "page.count", $"Expected {expectedPageCount} page payloads but found {pages.Count}.", "pages"));
}

var rawPages = pagesDocument.RootElement.ValueKind == JsonValueKind.Array
    ? pagesDocument.RootElement.EnumerateArray().ToArray()
    : Array.Empty<JsonElement>();
if (rawPages.Length != pages.Count)
{
    globalIssues.Add(new("error", "page.serialization.count", "Typed and raw page counts differ.", "pages"));
}

for (var index = 0; index < pages.Count; index++)
{
    var page = pages[index];
    var rawPage = index < rawPages.Length ? rawPages[index] : default;
    var issues = new List<ContractIssue>();
    var byteCount = Encoding.UTF8.GetByteCount(JsonSerializer.Serialize(page, options));

    Require(!string.IsNullOrWhiteSpace(page.PageId), "page.id.required", "Page ID is required.", "id", issues);
    Require(!string.IsNullOrWhiteSpace(page.PageSlug), "page.slug.required", "Page slug is required.", "pageSlug", issues);
    Require(page.TenantId == expectedTenant, "page.tenant", "Page tenant ID must match the expected route tenant.", "tenantId", issues);
    Require(byteCount < MaximumCosmosItemBytes, "page.size", $"Page payload is {byteCount} bytes and exceeds the pre-import limit.", "$", issues);
    Require(page.IsPublished == false, "page.publish.hold", "Page must remain unpublished.", "isPublished", issues);
    Require(page.IncludeInSitemap == false, "page.sitemap.hold", "Page must remain excluded from sitemap.", "includeInSitemap", issues);
    Require(page.Seo.Robots == "noindex, nofollow", "page.index.hold", "Page robots must remain noindex, nofollow.", "seo.robots", issues);
    Require(page.Workflow.ApprovedForPublish == false, "page.approval.hold", "Page publish approval must remain false.", "workflow.approvedForPublish", issues);
    Require(page.StaticPublishing.DeploymentStatus == "not_deployed", "page.deploy.hold", "Page deployment status must remain not_deployed.", "staticPublishing.deploymentStatus", issues);

    var classification = existingSlugs.Contains(page.PageSlug)
        ? "existing"
        : page.PageSlug == ContactSlug ? "repaired_contact" : "pending";

    var guard = DesignSystemGuard.ValidatePage(page);
    issues.AddRange(guard.Errors.Select(issue => new ContractIssue(issue.Severity, issue.Code, issue.Message, issue.Path)));
    issues.AddRange(guard.Warnings.Select(issue => new ContractIssue(issue.Severity, issue.Code, issue.Message, issue.Path)));

    var redirectIssue = PageRedirectGuard.ValidatePageRedirects(page);
    if (!string.IsNullOrWhiteSpace(redirectIssue))
    {
        issues.Add(new("error", "page.redirect", redirectIssue, "redirects"));
    }

    if (redirectApplication == "update-pending-pages" && classification == "pending")
    {
        ValidatePendingRedirectUpdatePersistence(page, tenantRedirectPlanKeys, issues);
    }

    ValidateReferencedDefinitions(rawPage, definitionByKey, issues);
    if (page.PageSlug == ContactSlug)
    {
        ValidateContactPage(page, rawPage, definitionByKey, issues);
    }

    rows.Add(new(
        index + 1,
        page.PageId,
        page.PageSlug,
        classification,
        byteCount,
        page.ContentData.ContentBlocks.Select(block => block.Type).ToArray(),
        page.Redirects.Count,
        issues.Count(issue => issue.Severity == "error") == 0,
        issues));
}

var remainingCount = rows.Count(row => row.Classification != "existing");
if (remainingCount != expectedRemainingCount)
{
    globalIssues.Add(new("error", "page.remaining.count", $"Expected {expectedRemainingCount} remaining pages but found {remainingCount}.", "pages"));
}
if (rows.Count(row => row.Classification == "repaired_contact") != 1)
{
    globalIssues.Add(new("error", "contact.count", "Exactly one repaired contact payload is required.", "pages"));
}
if (rows.Sum(row => row.RedirectCount) != expectedRedirectCount)
{
    globalIssues.Add(new("error", "redirect.count", $"Expected {expectedRedirectCount} redirects but found {rows.Sum(row => row.RedirectCount)}.", "pages.redirects"));
}

var errorCount = globalIssues.Count(issue => issue.Severity == "error") + rows.Sum(row => row.Issues.Count(issue => issue.Severity == "error"));
var warningCount = globalIssues.Count(issue => issue.Severity == "warning") + rows.Sum(row => row.Issues.Count(issue => issue.Severity == "warning"));
var result = new
{
    valid = errorCount == 0 && warningCount == 0,
    contractSources = redirectApplication == "update-pending-pages"
        ? new[] { "Program.cs create-page route", "DesignSystemGuard.cs", "PageRedirectGuard.cs", "PageRevisionHelper.cs", "TenantRedirect import plan", "Page.cs request model" }
        : new[] { "Program.cs create-page route", "DesignSystemGuard.cs", "PageRedirectGuard.cs", "Page.cs request model" },
    expectedTenant,
    redirectApplication,
    counts = new
    {
        pages = rows.Count,
        existing = rows.Count(row => row.Classification == "existing"),
        remaining = remainingCount,
        repairedContact = rows.Count(row => row.Classification == "repaired_contact"),
        pending = rows.Count(row => row.Classification == "pending"),
        redirects = rows.Sum(row => row.RedirectCount),
        globalFormDefinitions = definitions.Count,
        errors = errorCount,
        warnings = warningCount
    },
    globalIssues,
    pages = rows
};

Console.WriteLine(JsonSerializer.Serialize(result, new JsonSerializerOptions { WriteIndented = true }));
return result.valid ? 0 : 1;

static Dictionary<string, string> ParseArguments(string[] values)
{
    var parsed = new Dictionary<string, string>(StringComparer.Ordinal);
    for (var index = 0; index < values.Length; index += 2)
    {
        if (index + 1 >= values.Length || !values[index].StartsWith("--", StringComparison.Ordinal))
        {
            throw new ArgumentException("Arguments must use --name value pairs.");
        }
        parsed[values[index][2..]] = values[index + 1];
    }
    return parsed;
}

static int ReadInteger(IReadOnlyDictionary<string, string> values, string key, int fallback)
{
    return values.TryGetValue(key, out var raw) && int.TryParse(raw, out var parsed) ? parsed : fallback;
}

static void Require(bool condition, string code, string message, string path, ICollection<ContractIssue> issues)
{
    if (!condition) issues.Add(new("error", code, message, path));
}

static void AddDuplicateIssues(IEnumerable<string> values, string code, string label, ICollection<ContractIssue> issues)
{
    foreach (var duplicate in values.Where(value => !string.IsNullOrWhiteSpace(value)).GroupBy(value => value, StringComparer.Ordinal).Where(group => group.Count() > 1))
    {
        issues.Add(new("error", code, $"{label}: {duplicate.Key}.", "pages"));
    }
}

static void ValidateReferencedDefinitions(JsonElement rawPage, IReadOnlyDictionary<string, List<FormDefinition>> definitionByKey, ICollection<ContractIssue> issues)
{
    if (rawPage.ValueKind != JsonValueKind.Object || !TryGetBlogContent(rawPage, out var content)) return;

    if (content.TryGetProperty("referencedFormDefinitions", out var references) && references.ValueKind == JsonValueKind.Array)
    {
        foreach (var reference in references.EnumerateArray())
        {
            var key = GetString(reference, "formKey");
            Require(!string.IsNullOrWhiteSpace(key) && definitionByKey.TryGetValue(key, out var matches) && matches.Count == 1,
                "form.reference.unknown", $"Referenced global FormDefinition '{key}' must exist exactly once.",
                "ContentData.ContentBlocks.Blog.content.referencedFormDefinitions", issues);
        }
    }

    if (content.TryGetProperty("effectiveFormInstanceMappings", out var mappings) && mappings.ValueKind == JsonValueKind.Array)
    {
        foreach (var mapping in mappings.EnumerateArray())
        {
            var key = GetString(mapping, "normalizedFormKey");
            Require(!string.IsNullOrWhiteSpace(key) && definitionByKey.TryGetValue(key, out var matches) && matches.Count == 1,
                "form.instance.reference.unknown", $"Form instance references unknown global FormDefinition '{key}'.",
                "ContentData.ContentBlocks.Blog.content.effectiveFormInstanceMappings", issues);
        }
    }
}

static void ValidateContactPage(Page page, JsonElement rawPage, IReadOnlyDictionary<string, List<FormDefinition>> definitionByKey, ICollection<ContractIssue> issues)
{
    Require(page.FormDefinitions.Count == 0, "contact.form.embedded", "The contact page must reference the separately imported canonical FormDefinition, not embed a duplicate.", "formDefinitions", issues);
    if (!TryGetBlogContent(rawPage, out var blogContent))
    {
        issues.Add(new("error", "contact.source.blog", "The source-backed contact Blog block is required.", "ContentData.ContentBlocks"));
        return;
    }

    var body = GetString(blogContent, "body");
    Require(body.Contains("<form", StringComparison.OrdinalIgnoreCase) && body.Contains($"data-source-form-id=\"{ContactInstanceId}\"", StringComparison.Ordinal),
        "contact.source.form", "The fidelity-preserved visible contact form is missing.", "ContentData.ContentBlocks.Blog.content.body", issues);

    var rawBlocks = rawPage.GetProperty("ContentData").GetProperty("ContentBlocks");
    var formBlocks = rawBlocks.EnumerateArray().Where(block => GetString(block, "type") == "formBlock").ToArray();
    Require(formBlocks.Length == 1, "contact.formBlock.count", "Exactly one contact contract-bridge formBlock is required.", "ContentData.ContentBlocks", issues);
    if (formBlocks.Length != 1) return;

    var formBlock = formBlocks[0];
    var enabled = formBlock.TryGetProperty("enabled", out var enabledValue) && enabledValue.ValueKind == JsonValueKind.True;
    Require(!enabled, "contact.formBlock.duplicateVisible", "The contract bridge must stay disabled so it does not duplicate the source-backed visible form.", "ContentData.ContentBlocks.formBlock.enabled", issues);
    var content = formBlock.GetProperty("content");
    Require(GetString(content, "formKey") == "default-contact", "contact.formBlock.guardKey", "The API guard bridge must use the built-in default-contact key.", "ContentData.ContentBlocks.formBlock.content.formKey", issues);

    var canonicalKey = GetString(content, "canonicalFormDefinitionRef");
    Require(!string.IsNullOrWhiteSpace(canonicalKey) && definitionByKey.TryGetValue(canonicalKey, out var definitions) && definitions.Count == 1,
        "contact.formBlock.canonicalReference", $"Canonical global FormDefinition '{canonicalKey}' must exist exactly once.", "ContentData.ContentBlocks.formBlock.content.canonicalFormDefinitionRef", issues);
    if (!string.IsNullOrWhiteSpace(canonicalKey) && definitionByKey.TryGetValue(canonicalKey, out var matches) && matches.Count == 1)
    {
        Require(matches[0].SubmitAction == "preview-no-post", "contact.form.submitAction", "Canonical contact FormDefinition must remain preview-no-post.", "globalFormDefinitions.submitAction", issues);
    }
    Require(GetString(content, "canonicalFormInstanceRef") == ContactInstanceId, "contact.form.instance", "The contract bridge must reference the contact source form instance.", "ContentData.ContentBlocks.formBlock.content.canonicalFormInstanceRef", issues);
    Require(GetBoolean(content, "emailSendingEnabled") == false, "contact.form.email", "Contact email sending must remain disabled.", "ContentData.ContentBlocks.formBlock.content.emailSendingEnabled", issues);
}

static void ValidatePendingRedirectUpdatePersistence(Page page, IReadOnlySet<string> tenantRedirectPlanKeys, ICollection<ContractIssue> issues)
{
    var currentSlug = PageRedirectGuard.NormalizeSlug(page.PageSlug);
    foreach (var redirect in page.Redirects ?? new List<PageRedirect>())
    {
        var from = PageRedirectGuard.NormalizeSlug(redirect.From);
        var to = PageRedirectGuard.NormalizeSlug(redirect.To);
        if (string.Equals(from, currentSlug, StringComparison.Ordinal) &&
            !string.Equals(from, to, StringComparison.Ordinal))
        {
            if (tenantRedirectPlanKeys.Contains($"{from}|{to}"))
            {
                continue;
            }

            issues.Add(new(
                "error",
                "redirect.update.currentPageSourceUnsupported",
                $"Meaningful redirect from current page route '{from}' to distinct route '{to}' requires a matching validated tenant redirect import-plan action because PageRevisionHelper cannot persist it on the current page.",
                "redirects"));
        }
    }
}

static async Task<HashSet<string>> ReadTenantRedirectPlanKeysAsync(string planPath, string expectedTenant)
{
    using var document = JsonDocument.Parse(await File.ReadAllTextAsync(planPath));
    var keys = new HashSet<string>(StringComparer.Ordinal);
    var root = document.RootElement;
    if (!string.Equals(GetString(root, "schemaVersion"), "1.0.0", StringComparison.Ordinal) ||
        GetBoolean(root, "valid") != true ||
        !string.Equals(GetString(root, "status"), "persistable_idempotent_plan", StringComparison.Ordinal) ||
        !string.Equals(GetString(root, "tenantId"), expectedTenant, StringComparison.Ordinal) ||
        !root.TryGetProperty("counts", out var counts) || counts.ValueKind != JsonValueKind.Object ||
        GetInteger(counts, "blocked") != 0 ||
        !root.TryGetProperty("cycles", out var cycles) || cycles.ValueKind != JsonValueKind.Array || cycles.GetArrayLength() != 0 ||
        !root.TryGetProperty("actions", out var actions) || actions.ValueKind != JsonValueKind.Array)
    {
        return keys;
    }

    var expectedActionCount = GetInteger(counts, "createActions");
    if (expectedActionCount is null || expectedActionCount.Value != actions.GetArrayLength())
    {
        return keys;
    }

    var expectedEndpoint = $"/api/admin/tenants/{Uri.EscapeDataString(expectedTenant)}/redirects";
    foreach (var action in actions.EnumerateArray())
    {
        var statusCode = action.TryGetProperty("payload", out var candidatePayload) && candidatePayload.ValueKind == JsonValueKind.Object
            ? GetInteger(candidatePayload, "statusCode")
            : null;
        if (!string.Equals(GetString(action, "action"), "create", StringComparison.Ordinal) ||
            string.IsNullOrWhiteSpace(GetString(action, "idempotencyKey")) ||
            !string.Equals(GetString(action, "endpoint"), expectedEndpoint, StringComparison.Ordinal) ||
            !action.TryGetProperty("payload", out var payload) || payload.ValueKind != JsonValueKind.Object ||
            GetBoolean(payload, "active") != true ||
            GetBoolean(payload, "preserveQueryString") is null ||
            !string.Equals(GetString(payload, "targetStatus"), "resolved", StringComparison.Ordinal) ||
            GetString(payload, "pageShadowMode") is not ("none" or "redirect_precedes_page") ||
            string.IsNullOrWhiteSpace(GetString(payload, "sourcePackagePath")) ||
            string.IsNullOrWhiteSpace(GetString(payload, "sourceDeclaration")) ||
            string.IsNullOrWhiteSpace(GetString(payload, "auditCorrelationId")) ||
            statusCode is null ||
            !new[] { 301, 302, 307, 308 }.Contains(statusCode.Value))
        {
            return new HashSet<string>(StringComparer.Ordinal);
        }

        var source = PageRedirectGuard.NormalizeSlug(GetString(payload, "sourcePath"));
        var rawTarget = GetString(payload, "target");
        var targetKind = GetString(payload, "targetKind");
        string target;
        if (targetKind == "internal")
        {
            target = PageRedirectGuard.NormalizeSlug(rawTarget);
        }
        else if (targetKind == "external" &&
            Uri.TryCreate(rawTarget, UriKind.Absolute, out var externalTarget) &&
            externalTarget.Scheme is "http" or "https" &&
            string.IsNullOrWhiteSpace(externalTarget.UserInfo))
        {
            target = PageRedirectGuard.NormalizeSlug(externalTarget.AbsolutePath);
        }
        else
        {
            return new HashSet<string>(StringComparer.Ordinal);
        }

        if (string.IsNullOrWhiteSpace(source) ||
            string.IsNullOrWhiteSpace(target) ||
            string.Equals(source, target, StringComparison.Ordinal))
        {
            return new HashSet<string>(StringComparer.Ordinal);
        }

        keys.Add($"{source}|{target}");
    }

    return keys;
}

static bool TryGetBlogContent(JsonElement rawPage, out JsonElement content)
{
    content = default;
    if (rawPage.ValueKind != JsonValueKind.Object ||
        !rawPage.TryGetProperty("ContentData", out var contentData) ||
        !contentData.TryGetProperty("ContentBlocks", out var blocks) ||
        blocks.ValueKind != JsonValueKind.Array) return false;

    foreach (var block in blocks.EnumerateArray())
    {
        if (GetString(block, "type") == "Blog" && block.TryGetProperty("content", out content)) return true;
    }
    return false;
}

static string GetString(JsonElement element, string property)
{
    return element.ValueKind == JsonValueKind.Object && element.TryGetProperty(property, out var value) && value.ValueKind == JsonValueKind.String
        ? value.GetString() ?? string.Empty
        : string.Empty;
}

static bool? GetBoolean(JsonElement element, string property)
{
    if (element.ValueKind != JsonValueKind.Object || !element.TryGetProperty(property, out var value)) return null;
    return value.ValueKind switch
    {
        JsonValueKind.True => true,
        JsonValueKind.False => false,
        _ => null
    };
}

static int? GetInteger(JsonElement element, string property)
{
    return element.ValueKind == JsonValueKind.Object &&
        element.TryGetProperty(property, out var value) &&
        value.ValueKind == JsonValueKind.Number &&
        value.TryGetInt32(out var parsed)
            ? parsed
            : null;
}

record ContractIssue(string Severity, string Code, string Message, string Path);
record PageContractResult(int Order, string PageId, string PageSlug, string Classification, int Bytes, string[] BlockTypes, int RedirectCount, bool Valid, List<ContractIssue> Issues);
