using System.Text.Json;
using System.Text.Json.Nodes;
using pumpkin_api.Services;
using pumpkin_net_models;
using pumpkin_net_models.Models;

internal static class Program
{
    public static int Main(string[] args)
    {
        var options = ParseArgs(args);
        var command = options.Command;

        if (command is "-h" or "--help" or "help")
        {
            PrintHelp();
            return 0;
        }

        if (command != "validate-package" && command != "validate-page" && command != "validate-updated-home-contact")
        {
            Console.Error.WriteLine($"Unsupported command \"{command}\".");
            PrintHelp();
            return 2;
        }

        if (command == "validate-updated-home-contact")
        {
            var homePath = options.Get("home-path") ?? options.Get("home");
            var contactPath = options.Get("contact-path") ?? options.Get("contact");
            if (string.IsNullOrWhiteSpace(homePath) || string.IsNullOrWhiteSpace(contactPath))
            {
                Console.Error.WriteLine("Missing --home-path or --contact-path.");
                PrintHelp();
                return 2;
            }

            var pairReport = PageContractValidator.ValidateUpdatedHomeContact(
                Path.GetFullPath(homePath),
                Path.GetFullPath(contactPath));
            Console.WriteLine(JsonSerializer.Serialize(pairReport, PageContractValidator.ReportJsonOptions));
            return pairReport.Ok ? 0 : 1;
        }

        var targetPath = options.Get("path") ?? options.Get("p") ?? options.Positional.FirstOrDefault();
        if (string.IsNullOrWhiteSpace(targetPath))
        {
            Console.Error.WriteLine("Missing --path.");
            PrintHelp();
            return 2;
        }

        targetPath = Path.GetFullPath(targetPath);
        var report = command == "validate-page"
            ? PageContractValidator.ValidateSinglePage(targetPath)
            : PageContractValidator.ValidatePackage(targetPath);

        Console.WriteLine(JsonSerializer.Serialize(report, PageContractValidator.ReportJsonOptions));
        return report.Ok ? 0 : 1;
    }

    private static void PrintHelp()
    {
        Console.WriteLine("""
Pumpkin .NET Page Contract Tool

Commands:
  validate-package --path <folder>  Validate an import-candidate/review package folder.
  validate-page --path <file>       Validate one page JSON file.
  validate-updated-home-contact
    --home-path <file> --contact-path <file>
                                  Validate the updated Ice homepage/contact pair.

The tool deserializes page JSON through pumpkin-net-models Page/block classes,
runs API guard validation, performs a semantic JSON round trip, and reports
warnings/errors without writing CMS data.
""");
    }

    private static CliOptions ParseArgs(string[] args)
    {
        if (args.Length == 0)
            return new CliOptions();

        var options = new CliOptions { Command = args[0] };
        for (var index = 1; index < args.Length; index++)
        {
            var arg = args[index];
            if (!arg.StartsWith("--", StringComparison.Ordinal))
            {
                options.Positional.Add(arg);
                continue;
            }

            var key = arg[2..];
            var value = "true";
            if (index + 1 < args.Length && !args[index + 1].StartsWith("--", StringComparison.Ordinal))
            {
                value = args[index + 1];
                index++;
            }
            options.Flags[key] = value;
        }

        return options;
    }
}

sealed class CliOptions
{
    public string Command { get; init; } = "validate-package";
    public Dictionary<string, string> Flags { get; } = new(StringComparer.OrdinalIgnoreCase);
    public List<string> Positional { get; } = new();

    public string? Get(string key) => Flags.TryGetValue(key, out var value) ? value : null;
}

static class PageContractValidator
{
    private static readonly JsonSerializerOptions ContractJsonOptions = PageJsonConverter.GetDefaultOptions();
    private static readonly HashSet<string> SupportedBlockTypes = HtmlBlockFactory.GetSupportedBlockTypes().ToHashSet(StringComparer.Ordinal);
    private static readonly string[] PageFileSuffixes = { ".import-candidate.json", ".page.json", ".json" };
    private static readonly HashSet<string> ProductionPersistenceFieldNames = new(StringComparer.Ordinal)
    {
        "sectionVariant",
        "variant",
        "mediaAssetId",
        "assetId",
        "publicUrl",
        "requiredMediaSlotId",
        "mediaRequirementRef",
        "usageType",
        "status",
        "alt",
        "title",
        "caption",
        "description",
        "meta",
        "businessDisplayName",
        "publicEmailDisplayPolicy",
        "selectedMailbox",
        "selectedMailboxMetadata",
        "emailSendingEnabled",
        "selectedEmailProvider",
        "pumpkinAppSendStatus",
        "leadRecipientRef",
        "staticEndpointRef",
        "formKey",
        "sourcePage"
    };
    private static readonly string[] ProductionPersistencePathPrefixes =
    {
        "$.ContentData.ContentBlocks[",
        "$.media.",
        "$.domainRouting.",
        "$.formConfig."
    };

    public static readonly JsonSerializerOptions ReportJsonOptions = new()
    {
        WriteIndented = true,
        DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
    };

    public static ContractReport ValidatePackage(string packagePath)
    {
        var report = CreateReport("validate-package", packagePath);
        if (!Directory.Exists(packagePath))
        {
            report.AddError("package.path", $"Package folder not found: {packagePath}", packagePath);
            report.FinalizeDecision();
            return report;
        }

        var packageFile = Path.Combine(packagePath, "ice-launch-import-candidate-package.json");
        if (!File.Exists(packageFile))
        {
            packageFile = Directory.GetFiles(packagePath, "*package*.json").FirstOrDefault() ?? string.Empty;
        }

        JsonObject? packageJson = null;
        if (string.IsNullOrWhiteSpace(packageFile) || !File.Exists(packageFile))
        {
            report.AddWarning("package.file", "No package manifest JSON was found. Falling back to page-file discovery.", packagePath);
        }
        else
        {
            packageJson = ReadJsonObject(packageFile, report);
            if (packageJson != null)
            {
                ValidatePackageManifest(packageJson, packageFile, packagePath, report);
                ValidateThemeDesignSystem(packageJson, packageFile, report);
                ValidatePackageFormDefinitions(packageJson, packageFile, report);
                ValidateMediaRequirements(packageJson, packageFile, report);
            }
        }

        foreach (var formFile in DiscoverFormDefinitionFiles(packagePath, packageJson))
        {
            ValidateFormDefinitionFile(formFile, report);
        }

        var pageFiles = DiscoverPageFiles(packagePath, packageJson).ToList();
        if (pageFiles.Count == 0)
        {
            report.AddError("package.pages", "No page JSON files were found for .NET contract validation.", packagePath);
        }

        foreach (var pageFile in pageFiles)
        {
            ValidatePageFile(pageFile, report);
        }

        ValidateStateCityGenerationPolicy(report);
        report.FinalizeDecision();
        return report;
    }

    public static ContractReport ValidateSinglePage(string pagePath)
    {
        var report = CreateReport("validate-page", pagePath);
        if (!File.Exists(pagePath))
        {
            report.AddError("page.path", $"Page file not found: {pagePath}", pagePath);
            report.FinalizeDecision();
            return report;
        }

        ValidatePageFile(pagePath, report);
        report.FinalizeDecision();
        return report;
    }

    public static ContractReport ValidateUpdatedHomeContact(string homePath, string contactPath)
    {
        var report = CreateReport("validate-updated-home-contact", $"{homePath};{contactPath}");

        if (!File.Exists(homePath))
        {
            report.AddError("page.path", $"Homepage file not found: {homePath}", homePath);
        }

        if (!File.Exists(contactPath))
        {
            report.AddError("page.path", $"Contact file not found: {contactPath}", contactPath);
        }

        if (report.Errors.Count == 0)
        {
            ValidatePageFile(homePath, report);
            ValidatePageFile(contactPath, report);
            ValidateUpdatedHomeContactPair(report);
        }

        report.FinalizeDecision();
        return report;
    }

    private static ContractReport CreateReport(string command, string targetPath)
    {
        return new ContractReport
        {
            Command = command,
            TargetPath = targetPath,
            GeneratedAt = DateTime.UtcNow.ToString("O"),
            Rule = "CMS-ready/import-candidate/production-bound page JSON must deserialize through .NET Page/block classes and pass contract validation before CMS import or static production use."
        };
    }

    private static void ValidatePackageManifest(JsonObject packageJson, string packageFile, string packagePath, ContractReport report)
    {
        var tenantId = StringValue(packageJson["tenantId"]);
        var siteKey = StringValue(packageJson["siteKey"]);
        var domain = StringValue(packageJson["domain"]);

        if (tenantId != "ice-rink-rentals")
            report.AddError("package.tenantId", "Ice import-candidate package tenantId must be ice-rink-rentals.", packageFile);
        if (siteKey != "ice-rink-rentals")
            report.AddError("package.siteKey", "Ice import-candidate package siteKey must be ice-rink-rentals.", packageFile);
        if (domain != "iceskatingrinkrentals.com")
            report.AddError("package.domain", "Ice import-candidate package domain must be iceskatingrinkrentals.com.", packageFile);

        var pageFiles = packageJson["pageFiles"] as JsonArray;
        if (pageFiles == null || pageFiles.Count == 0)
        {
            report.AddWarning("package.pageFiles", "Package manifest has no pageFiles array; discovery fallback will be used.", packageFile);
        }
        else
        {
            foreach (var item in pageFiles.OfType<JsonObject>())
            {
                var file = StringValue(item["file"]);
                if (string.IsNullOrWhiteSpace(file)) continue;
                var fullPath = Path.Combine(packagePath, file);
                if (!File.Exists(fullPath))
                    report.AddError("package.pageFile.missing", $"Referenced page file is missing: {file}", packageFile);
            }
        }

        report.Package = new PackageContractSummary
        {
            File = ToDisplayPath(packageFile),
            TenantId = tenantId,
            SiteKey = siteKey,
            Domain = domain,
            PageFileCount = pageFiles?.Count ?? 0
        };
    }

    private static void ValidateThemeDesignSystem(JsonObject packageJson, string packageFile, ContractReport report)
    {
        if (packageJson["themeDesignSystemRecommendation"] is not JsonObject designSystemNode)
        {
            report.AddWarning("package.themeDesignSystem", "No themeDesignSystemRecommendation was included in the package.", packageFile);
            return;
        }

        try
        {
            var designSystem = designSystemNode.Deserialize<ThemeDesignSystem>(ContractJsonOptions) ?? new ThemeDesignSystem();
            var theme = new Theme
            {
                TenantId = "ice-rink-rentals",
                ThemeId = "ice-import-candidate-theme-contract",
                Name = "Ice Import Candidate Theme Contract",
                DesignSystem = designSystem
            };
            var validation = DesignSystemGuard.ValidateTheme(theme, "ice-rink-rentals");
            AddGuardIssues(validation, report, packageFile, "theme");
            report.ThemeDesignSystem = new ThemeContractSummary
            {
                Present = true,
                DotNetDeserialized = true,
                TokenCategoryCount = designSystem.Tokens.Count,
                SectionVariantCount = designSystem.SectionVariants.Count,
                ApprovedClassCount = designSystem.ApprovedClasses.Count,
                ErrorCount = validation.Errors.Count,
                WarningCount = validation.Warnings.Count
            };
        }
        catch (Exception ex)
        {
            report.AddError("theme.deserialize", $"Theme design system failed .NET deserialization: {ex.Message}", packageFile);
            report.ThemeDesignSystem = new ThemeContractSummary { Present = true, DotNetDeserialized = false };
        }
    }

    private static void ValidatePackageFormDefinitions(JsonObject packageJson, string packageFile, ContractReport report)
    {
        if (packageJson["formDefinitions"] is not JsonArray formDefinitions)
        {
            report.AddWarning("package.formDefinitions", "Package has no inline formDefinitions array.", packageFile);
            return;
        }

        foreach (var node in formDefinitions)
        {
            if (node == null) continue;
            ValidateFormDefinitionJson(node.ToJsonString(), packageFile, report);
        }
    }

    private static void ValidateFormDefinitionFile(string formFile, ContractReport report)
    {
        try
        {
            ValidateFormDefinitionJson(File.ReadAllText(formFile), formFile, report);
        }
        catch (Exception ex)
        {
            report.AddError("form.file", $"Unable to read form definition: {ex.Message}", formFile);
        }
    }

    private static void ValidateFormDefinitionJson(string rawJson, string file, ContractReport report)
    {
        try
        {
            var definition = JsonSerializer.Deserialize<FormDefinition>(rawJson, ContractJsonOptions);
            if (definition == null)
            {
                report.AddError("form.deserialize", "FormDefinition deserialized to null.", file);
                return;
            }

            var validationPage = new Page
            {
                PageId = $"form-contract-{definition.FormKey}",
                TenantId = string.IsNullOrWhiteSpace(definition.TenantId) ? "ice-rink-rentals" : definition.TenantId,
                PageSlug = "form-contract",
                FormDefinitions = new List<FormDefinition> { definition }
            };
            var validation = DesignSystemGuard.ValidatePage(validationPage);
            AddGuardIssues(validation, report, file, "form");
            report.FormDefinitions.Add(new FormContractSummary
            {
                File = ToDisplayPath(file),
                FormKey = definition.FormKey,
                TenantId = definition.TenantId,
                FieldCount = definition.Fields.Count,
                HiddenFieldCount = definition.HiddenFields.Count,
                ErrorCount = validation.Errors.Count,
                WarningCount = validation.Warnings.Count
            });
        }
        catch (Exception ex)
        {
            report.AddError("form.deserialize", $"FormDefinition failed .NET deserialization: {ex.Message}", file);
        }
    }

    private static void ValidatePageFile(string pageFile, ContractReport report)
    {
        var pageSummary = new PageContractSummary { File = ToDisplayPath(pageFile) };
        report.Pages.Add(pageSummary);

        JsonObject? pageJson = null;
        try
        {
            pageJson = ReadJsonObject(pageFile, report);
            if (pageJson == null)
            {
                pageSummary.ErrorCount++;
                return;
            }

            var rawJson = File.ReadAllText(pageFile);
            var page = JsonSerializer.Deserialize<Page>(rawJson, ContractJsonOptions);
            if (page == null)
            {
                report.AddError("page.deserialize", "Page deserialized to null.", pageFile);
                pageSummary.ErrorCount++;
                return;
            }

            pageSummary.PageId = page.PageId;
            pageSummary.PageSlug = page.PageSlug;
            pageSummary.TenantId = page.TenantId;
            pageSummary.BlockCount = page.ContentData.ContentBlocks.Count;
            pageSummary.BlockTypes = page.ContentData.ContentBlocks.Select(block => block.Type).ToList();
            pageSummary.DotNetDeserialized = true;

            ValidateBasicPageContract(page, pageJson, pageFile, report);
            ValidateSupportedBlocks(page, pageFile, report);
            ValidateStateCityRouteIfPresent(page, pageFile, report);

            var guard = DesignSystemGuard.ValidatePage(page);
            AddGuardIssues(guard, report, pageFile, "page");

            var roundTrip = ValidatePageRoundTrip(page, pageFile, report);
            pageSummary.RoundTripOk = roundTrip;
            pageSummary.ProductionFieldPersistenceOk = ValidateProductionFieldPersistence(pageJson, page, pageFile, report);
            pageSummary.UpdatedHomeContactPersistenceOk = ValidateUpdatedHomeContactRequiredPersistence(pageJson, page, pageFile, report);

            ValidateMediaRequirements(pageJson, pageFile, report);

            pageSummary.ErrorCount = report.Errors.Count(issue => issue.File == ToDisplayPath(pageFile));
            pageSummary.WarningCount = report.Warnings.Count(issue => issue.File == ToDisplayPath(pageFile));
        }
        catch (Exception ex)
        {
            report.AddError("page.deserialize", $"Page failed .NET contract validation: {ex.Message}", pageFile);
            pageSummary.ErrorCount++;
        }
    }

    private static void ValidateBasicPageContract(Page page, JsonObject pageJson, string pageFile, ContractReport report)
    {
        if (string.IsNullOrWhiteSpace(page.PageId))
            report.AddError("page.PageId", "PageId is required for CMS-bound pages.", pageFile);
        if (string.IsNullOrWhiteSpace(page.TenantId))
            report.AddError("page.tenantId", "tenantId is required for CMS-bound pages.", pageFile);
        if (page.TenantId != "ice-rink-rentals")
            report.AddError("page.tenantId.ice", "Ice import-candidate pages must use tenantId ice-rink-rentals.", pageFile);
        if (string.IsNullOrWhiteSpace(page.PageSlug))
            report.AddError("page.pageSlug", "pageSlug is required for CMS-bound pages.", pageFile);
        if (page.ContentData?.ContentBlocks == null)
            report.AddError("page.ContentData.ContentBlocks", "ContentData.ContentBlocks must deserialize as a .NET block list.", pageFile);
        if (string.IsNullOrWhiteSpace(page.Seo.MetaTitle))
            report.AddWarning("page.seo.metaTitle", "SEO metaTitle is empty.", pageFile);
        if (string.IsNullOrWhiteSpace(page.Seo.MetaDescription))
            report.AddWarning("page.seo.metaDescription", "SEO metaDescription is empty.", pageFile);
        if (!string.IsNullOrWhiteSpace(page.Seo.CanonicalUrl) && !page.Seo.CanonicalUrl.StartsWith("https://iceskatingrinkrentals.com", StringComparison.Ordinal))
            report.AddError("page.seo.canonicalUrl", "Ice canonicalUrl must use https://iceskatingrinkrentals.com.", pageFile);

        foreach (var ignoredField in new[] { "reviewMetadata", "mediaRequirements", "designSystem", "templatePurpose", "contentPackageVersion" })
        {
            if (pageJson.ContainsKey(ignoredField))
            {
                report.AddWarning("page.reviewOnlyField", $"Root field \"{ignoredField}\" is review/import-candidate metadata and is not part of the canonical .NET Page model.", pageFile);
            }
        }
    }

    private static void ValidateSupportedBlocks(Page page, string pageFile, ContractReport report)
    {
        for (var index = 0; index < page.ContentData.ContentBlocks.Count; index++)
        {
            var block = page.ContentData.ContentBlocks[index];
            if (!SupportedBlockTypes.Contains(block.Type))
            {
                report.AddError("block.type.unknown", $"Unsupported block type \"{block.Type}\" at ContentData.ContentBlocks[{index}].", pageFile);
            }

            switch (block)
            {
                case CustomHtmlBlock customHtml:
                    if (customHtml.Content is not CustomHtmlContent)
                        report.AddError("block.customHtml.content", "customHtml content did not deserialize into CustomHtmlContent.", pageFile);
                    break;
                case TrustedEmbedBlock trustedEmbed:
                    if (trustedEmbed.Content is not TrustedEmbedContent)
                        report.AddError("block.trustedEmbed.content", "trustedEmbed content did not deserialize into TrustedEmbedContent.", pageFile);
                    break;
                case FormBlock formBlock:
                    if (formBlock.Content is not FormBlockContent)
                        report.AddError("block.formBlock.content", "formBlock content did not deserialize into FormBlockContent.", pageFile);
                    break;
            }
        }
    }

    private static bool ValidatePageRoundTrip(Page page, string pageFile, ContractReport report)
    {
        var canonicalJson = PageJsonConverter.ToJson(page);
        if (string.IsNullOrWhiteSpace(canonicalJson))
        {
            report.AddError("roundTrip.serialize", "Page failed .NET canonical serialization.", pageFile);
            return false;
        }

        var roundTripped = JsonSerializer.Deserialize<Page>(canonicalJson, ContractJsonOptions);
        if (roundTripped == null)
        {
            report.AddError("roundTrip.deserialize", "Canonical JSON failed .NET deserialization.", pageFile);
            return false;
        }

        var originalTypes = page.ContentData.ContentBlocks.Select(block => block.Type).ToArray();
        var roundTripTypes = roundTripped.ContentData.ContentBlocks.Select(block => block.Type).ToArray();
        if (page.PageId != roundTripped.PageId ||
            page.TenantId != roundTripped.TenantId ||
            page.PageSlug != roundTripped.PageSlug ||
            originalTypes.Length != roundTripTypes.Length ||
            !originalTypes.SequenceEqual(roundTripTypes))
        {
            report.AddError("roundTrip.semantic", "Page semantic contract changed during .NET round trip.", pageFile);
            return false;
        }

        return true;
    }

    private static bool? ValidateUpdatedHomeContactRequiredPersistence(JsonObject originalJson, Page page, string pageFile, ContractReport report)
    {
        if (!IsUpdatedHomeContactCandidate(page))
            return null;

        var canonicalJson = PageJsonConverter.ToJson(page);
        if (string.IsNullOrWhiteSpace(canonicalJson))
        {
            report.AddError("updatedHomeContactPersistence.serialize", "Page failed .NET canonical serialization for updated home/contact persistence comparison.", pageFile);
            return false;
        }

        JsonNode? roundTripJson;
        try
        {
            roundTripJson = JsonNode.Parse(canonicalJson);
        }
        catch (JsonException ex)
        {
            report.AddError("updatedHomeContactPersistence.parse", $"Canonical JSON failed updated home/contact persistence parse: {ex.Message}", pageFile);
            return false;
        }

        var requiredPaths = new List<string>
        {
            "$.domainRouting.publicEmailDisplayPolicy",
            "$.domainRouting.selectedMailbox",
            "$.domainRouting.selectedMailboxMetadata",
            "$.domainRouting.leadRecipientRef",
            "$.domainRouting.staticEndpointRef",
            "$.media.featuredImage.mediaAssetId",
            "$.media.heroImage.mediaAssetId",
            "$.media.localImage.mediaAssetId",
            "$.media.closingImage.mediaAssetId",
            "$.media.openGraphImage.mediaAssetId",
            "$.media.logo.mediaAssetId",
            "$.media.setupImage.mediaAssetId"
        };

        if (page.PageSlug.Equals("contact", StringComparison.OrdinalIgnoreCase))
        {
            requiredPaths.AddRange(new[]
            {
                "$.ContentData.ContentBlocks[formBlock].content.formKey",
                "$.ContentData.ContentBlocks[formBlock].content.sourcePage",
                "$.ContentData.ContentBlocks[formBlock].content.staticEndpointRef",
                "$.ContentData.ContentBlocks[formBlock].content.leadRecipientRef"
            });
        }

        var missingOriginal = requiredPaths
            .Where(path => !HasComparablePersistenceValue(GetRequiredNode(originalJson, path)))
            .ToList();
        foreach (var path in missingOriginal)
        {
            report.AddError(
                "updatedHomeContactPersistence.required",
                $"Required updated home/contact field is missing before .NET round trip: {path}.",
                pageFile,
                path);
        }

        var checks = new List<PersistenceCheck>();
        foreach (var path in requiredPaths)
        {
            var originalValue = GetRequiredNode(originalJson, path);
            if (!HasComparablePersistenceValue(originalValue))
                continue;
            checks.Add(new PersistenceCheck(path, PathFieldName(path), JsonNode.DeepEquals(originalValue, GetRequiredNode(roundTripJson, path))));
        }

        CollectPersistenceChecks(originalJson, roundTripJson, "$", checks);
        var missing = checks.Where(check => !check.Ok).DistinctBy(check => check.Path).Take(50).ToList();
        foreach (var check in missing)
        {
            report.AddError(
                "updatedHomeContactPersistence.strip",
                $"Updated home/contact field \"{check.FieldName}\" changed or was stripped during .NET Page/block round trip.",
                pageFile,
                check.Path);
        }

        var ok = missingOriginal.Count == 0 && missing.Count == 0;
        if (ok)
        {
            report.AddWarning(
                "updatedHomeContactPersistence.checked",
                $"Verified {checks.Select(check => check.Path).Distinct().Count()} updated home/contact renderer/media/contact-policy field(s) through the .NET Page/block round trip.",
                pageFile);
        }

        return ok;
    }

    private static bool ValidateProductionFieldPersistence(JsonObject originalJson, Page page, string pageFile, ContractReport report)
    {
        var canonicalJson = PageJsonConverter.ToJson(page);
        if (string.IsNullOrWhiteSpace(canonicalJson))
        {
            report.AddError("productionFieldPersistence.serialize", "Page failed .NET canonical serialization for persistence comparison.", pageFile);
            return false;
        }

        JsonNode? roundTripJson;
        try
        {
            roundTripJson = JsonNode.Parse(canonicalJson);
        }
        catch (JsonException ex)
        {
            report.AddError("productionFieldPersistence.parse", $"Canonical JSON failed persistence parse: {ex.Message}", pageFile);
            return false;
        }

        var checks = new List<PersistenceCheck>();
        CollectPersistenceChecks(originalJson, roundTripJson, "$", checks);
        var missing = checks.Where(check => !check.Ok).Take(25).ToList();
        if (missing.Count > 0)
        {
            foreach (var check in missing)
            {
                report.AddError(
                    "productionFieldPersistence.strip",
                    $"Field \"{check.FieldName}\" changed or was stripped during .NET Page/block round trip.",
                    pageFile,
                    check.Path);
            }

            var remaining = checks.Count(check => !check.Ok) - missing.Count;
            if (remaining > 0)
            {
                report.AddError(
                    "productionFieldPersistence.strip",
                    $"{remaining} additional production persistence field(s) changed or were stripped during .NET Page/block round trip.",
                    pageFile);
            }

            return false;
        }

        if (checks.Count > 0)
        {
            report.AddWarning(
                "productionFieldPersistence.checked",
                $"Verified {checks.Count} production renderer/media/email-policy field(s) through the .NET Page/block round trip.",
                pageFile);
        }

        return true;
    }

    private static void CollectPersistenceChecks(JsonNode? originalNode, JsonNode? roundTripNode, string path, List<PersistenceCheck> checks)
    {
        if (originalNode is JsonObject originalObject)
        {
            var roundTripObject = roundTripNode as JsonObject;
            foreach (var property in originalObject)
            {
                var childPath = $"{path}.{property.Key}";
                var originalChild = property.Value;
                var roundTripChild = roundTripObject != null && roundTripObject.TryGetPropertyValue(property.Key, out var candidate)
                    ? candidate
                    : null;

                if (ShouldCheckProductionPersistencePath(childPath) &&
                    ProductionPersistenceFieldNames.Contains(property.Key) &&
                    HasComparablePersistenceValue(originalChild))
                {
                    checks.Add(new PersistenceCheck(
                        childPath,
                        property.Key,
                        JsonNode.DeepEquals(originalChild, roundTripChild)));
                }

                CollectPersistenceChecks(originalChild, roundTripChild, childPath, checks);
            }

            return;
        }

        if (originalNode is JsonArray originalArray)
        {
            var roundTripArray = roundTripNode as JsonArray;
            for (var index = 0; index < originalArray.Count; index++)
            {
                var originalChild = originalArray[index];
                var roundTripChild = roundTripArray != null && index < roundTripArray.Count ? roundTripArray[index] : null;
                CollectPersistenceChecks(originalChild, roundTripChild, $"{path}[{index}]", checks);
            }
        }
    }

    private static bool HasComparablePersistenceValue(JsonNode? node)
    {
        if (node == null)
            return false;

        if (node is JsonValue value)
        {
            if (value.TryGetValue<string>(out var stringValue))
                return !string.IsNullOrWhiteSpace(stringValue);

            return true;
        }

        if (node is JsonArray array)
            return array.Count > 0;

        if (node is JsonObject obj)
            return obj.Count > 0;

        return false;
    }

    private static bool ShouldCheckProductionPersistencePath(string path)
    {
        return ProductionPersistencePathPrefixes.Any(prefix => path.StartsWith(prefix, StringComparison.Ordinal));
    }

    private static void ValidateUpdatedHomeContactPair(ContractReport report)
    {
        var home = report.Pages.FirstOrDefault(page => page.PageSlug == "home");
        var contact = report.Pages.FirstOrDefault(page => page.PageSlug == "contact");
        if (home == null)
        {
            report.AddError("updatedHomeContactPair.home", "Updated home/contact validation requires a homepage candidate with pageSlug home.", report.TargetPath);
        }
        if (contact == null)
        {
            report.AddError("updatedHomeContactPair.contact", "Updated home/contact validation requires a contact candidate with pageSlug contact.", report.TargetPath);
        }
        if (home?.UpdatedHomeContactPersistenceOk == false || contact?.UpdatedHomeContactPersistenceOk == false)
        {
            report.AddError("updatedHomeContactPair.persistence", "Homepage and contact candidates must both pass updated home/contact persistence checks.", report.TargetPath);
        }
    }

    private static bool IsUpdatedHomeContactCandidate(Page page)
    {
        if (!page.TenantId.Equals("ice-rink-rentals", StringComparison.Ordinal))
            return false;
        if (!page.PageSlug.Equals("home", StringComparison.OrdinalIgnoreCase) &&
            !page.PageSlug.Equals("contact", StringComparison.OrdinalIgnoreCase))
            return false;

        var templateKey = page.Template?.TemplateKey ?? string.Empty;
        var layoutVariant = page.Template?.LayoutVariant ?? string.Empty;
        var contentModelVersion = page.Template?.ContentModelVersion ?? string.Empty;
        return templateKey.Contains("ice-homepage", StringComparison.OrdinalIgnoreCase) ||
               templateKey.Equals("contact", StringComparison.OrdinalIgnoreCase) ||
               layoutVariant.Equals("production-renderer-compatible", StringComparison.OrdinalIgnoreCase) ||
               contentModelVersion.Contains("production-renderer-compatible", StringComparison.OrdinalIgnoreCase);
    }

    private static JsonNode? GetRequiredNode(JsonNode? node, string jsonPath)
    {
        if (node == null || !jsonPath.StartsWith("$.", StringComparison.Ordinal))
            return null;

        var current = node;
        foreach (var segment in jsonPath[2..].Split('.'))
        {
            if (segment == "ContentData")
            {
                current = (current as JsonObject)?["ContentData"];
                continue;
            }

            if (segment.StartsWith("ContentBlocks[", StringComparison.Ordinal))
            {
                var selector = segment["ContentBlocks[".Length..^1];
                var array = (current as JsonObject)?["ContentBlocks"] as JsonArray;
                current = selector == "formBlock"
                    ? array?.OfType<JsonObject>().FirstOrDefault(item => StringValue(item["type"]) == "formBlock")
                    : int.TryParse(selector, out var index) && array != null && index >= 0 && index < array.Count
                        ? array[index]
                        : null;
                continue;
            }

            current = (current as JsonObject)?[segment];
        }

        return current;
    }

    private static string PathFieldName(string jsonPath)
    {
        var lastDot = jsonPath.LastIndexOf('.');
        return lastDot >= 0 ? jsonPath[(lastDot + 1)..] : jsonPath;
    }

    private static void ValidateMediaRequirements(JsonObject json, string file, ContractReport report)
    {
        if (json["mediaRequirements"] is not JsonArray mediaRequirements)
            return;

        var count = 0;
        var blockers = 0;
        foreach (var node in mediaRequirements.OfType<JsonObject>())
        {
            count++;
            var slotId = StringValue(node["requiredMediaSlotId"]);
            if (string.IsNullOrWhiteSpace(slotId))
                report.AddError("mediaRequirements.requiredMediaSlotId", "Media requirement entries must include requiredMediaSlotId.", file);
            if (StringValue(node["status"]) == "needs-upload" || node["mediaAssetId"] == null)
                blockers++;
            if (StringValue(node["mediaAssetId"]).StartsWith("http", StringComparison.OrdinalIgnoreCase))
                report.AddError("mediaRequirements.mediaAssetId", "mediaAssetId must be a MediaAsset id/reference, not a URL.", file);
        }

        if (count > 0)
        {
            report.MediaRequirements.Add(new MediaRequirementSummary
            {
                File = ToDisplayPath(file),
                RequirementCount = count,
                BlockerCount = blockers
            });
            if (blockers > 0)
                report.AddWarning("mediaRequirements.unresolved", $"{blockers} media requirement(s) still need approved MediaAsset selection before CMS-ready status.", file);
        }
    }

    private static void ValidateStateCityRouteIfPresent(Page page, string pageFile, ContractReport report)
    {
        var state = page.SearchData.State?.Trim() ?? string.Empty;
        var city = page.SearchData.City?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(state) || string.IsNullOrWhiteSpace(city))
            return;

        var expectedSlug = $"{state.ToLowerInvariant()}-{Slugify(city)}";
        if (page.PageSlug != expectedSlug)
        {
            report.AddError("stateCity.route", $"Generated city pages must use /state-city route shape. Expected pageSlug \"{expectedSlug}\" for {city}, {state}.", pageFile);
        }
    }

    private static void ValidateStateCityGenerationPolicy(ContractReport report)
    {
        report.StateCityGenerationPolicy = new StateCityGenerationPolicy
        {
            RoutePattern = "/state-city",
            Examples = new List<string> { "/fl-orlando", "/ny-new-york", "/pa-philadelphia" },
            RequiresDotNetPageClasses = true,
            CreatedPageInThisPhase = false,
            Notes = "Future city/location page generation must create Page and block objects through pumpkin-net-models, then pass this .NET contract tool, TypeScript validators, static validation, and import preflight."
        };
    }

    private static JsonObject? ReadJsonObject(string file, ContractReport report)
    {
        try
        {
            var node = JsonNode.Parse(File.ReadAllText(file)) as JsonObject;
            if (node == null)
                report.AddError("json.shape", "JSON root must be an object.", file);
            return node;
        }
        catch (Exception ex)
        {
            report.AddError("json.parse", $"JSON parse failed: {ex.Message}", file);
            return null;
        }
    }

    private static IEnumerable<string> DiscoverPageFiles(string packagePath, JsonObject? packageJson)
    {
        if (packageJson?["pageFiles"] is JsonArray pageFiles)
        {
            foreach (var item in pageFiles.OfType<JsonObject>())
            {
                var file = StringValue(item["file"]);
                if (!string.IsNullOrWhiteSpace(file))
                    yield return Path.GetFullPath(Path.Combine(packagePath, file));
            }
            yield break;
        }

        foreach (var file in Directory.GetFiles(packagePath, "*.json"))
        {
            var name = Path.GetFileName(file);
            if (name.Contains("package", StringComparison.OrdinalIgnoreCase) ||
                name.Contains("manifest", StringComparison.OrdinalIgnoreCase) ||
                name.Contains("form-definition", StringComparison.OrdinalIgnoreCase))
                continue;
            if (PageFileSuffixes.Any(suffix => name.EndsWith(suffix, StringComparison.OrdinalIgnoreCase)))
                yield return file;
        }
    }

    private static IEnumerable<string> DiscoverFormDefinitionFiles(string packagePath, JsonObject? packageJson)
    {
        if (packageJson?["defaultForms"] is JsonObject defaultForms &&
            defaultForms["files"] is JsonArray files)
        {
            foreach (var item in files)
            {
                var file = StringValue(item);
                if (!string.IsNullOrWhiteSpace(file))
                    yield return Path.GetFullPath(Path.Combine(packagePath, file));
            }
            yield break;
        }

        foreach (var file in Directory.GetFiles(packagePath, "*.form-definition.json"))
            yield return file;
    }

    private static void AddGuardIssues(DesignSystemGuardResult validation, ContractReport report, string file, string scope)
    {
        foreach (var issue in validation.Errors)
            report.AddError($"{scope}.{issue.Code}", issue.Message, file, issue.Path);
        foreach (var issue in validation.Warnings)
            report.AddWarning($"{scope}.{issue.Code}", issue.Message, file, issue.Path);
    }

    private static string StringValue(JsonNode? node)
    {
        if (node == null)
            return string.Empty;
        return node.GetValueKind() == JsonValueKind.String ? node.GetValue<string>().Trim() : node.ToJsonString().Trim('"');
    }

    private static string Slugify(string value)
    {
        var chars = value.Trim().ToLowerInvariant().Select(character =>
            char.IsLetterOrDigit(character) ? character : '-').ToArray();
        var slug = new string(chars);
        while (slug.Contains("--", StringComparison.Ordinal))
            slug = slug.Replace("--", "-", StringComparison.Ordinal);
        return slug.Trim('-');
    }

    private static string ToDisplayPath(string file)
    {
        return file.Replace(Path.DirectorySeparatorChar, '/');
    }
}

sealed class ContractReport
{
    public string Command { get; set; } = string.Empty;
    public string TargetPath { get; set; } = string.Empty;
    public string GeneratedAt { get; set; } = string.Empty;
    public string Rule { get; set; } = string.Empty;
    public bool Ok { get; set; }
    public string ReadinessDecision { get; set; } = string.Empty;
    public PackageContractSummary? Package { get; set; }
    public ThemeContractSummary? ThemeDesignSystem { get; set; }
    public List<PageContractSummary> Pages { get; } = new();
    public List<FormContractSummary> FormDefinitions { get; } = new();
    public List<MediaRequirementSummary> MediaRequirements { get; } = new();
    public StateCityGenerationPolicy? StateCityGenerationPolicy { get; set; }
    public List<ContractIssue> Errors { get; } = new();
    public List<ContractIssue> Warnings { get; } = new();

    public void AddError(string code, string message, string file, string? path = null)
    {
        Errors.Add(new ContractIssue("error", code, message, file.Replace(Path.DirectorySeparatorChar, '/'), path));
    }

    public void AddWarning(string code, string message, string file, string? path = null)
    {
        Warnings.Add(new ContractIssue("warning", code, message, file.Replace(Path.DirectorySeparatorChar, '/'), path));
    }

    public void FinalizeDecision()
    {
        Ok = Errors.Count == 0;
        ReadinessDecision = Ok
            ? "dotnet-contract-valid-not-cms-import-ready"
            : "dotnet-contract-blocked";
    }
}

sealed record ContractIssue(string Severity, string Code, string Message, string File, string? Path = null);

sealed class PackageContractSummary
{
    public string File { get; set; } = string.Empty;
    public string TenantId { get; set; } = string.Empty;
    public string SiteKey { get; set; } = string.Empty;
    public string Domain { get; set; } = string.Empty;
    public int PageFileCount { get; set; }
}

sealed class PageContractSummary
{
    public string File { get; set; } = string.Empty;
    public string PageId { get; set; } = string.Empty;
    public string PageSlug { get; set; } = string.Empty;
    public string TenantId { get; set; } = string.Empty;
    public bool DotNetDeserialized { get; set; }
    public bool RoundTripOk { get; set; }
    public bool ProductionFieldPersistenceOk { get; set; }
    public bool? UpdatedHomeContactPersistenceOk { get; set; }
    public int BlockCount { get; set; }
    public List<string> BlockTypes { get; set; } = new();
    public int ErrorCount { get; set; }
    public int WarningCount { get; set; }
}

sealed record PersistenceCheck(string Path, string FieldName, bool Ok);

sealed class FormContractSummary
{
    public string File { get; set; } = string.Empty;
    public string FormKey { get; set; } = string.Empty;
    public string TenantId { get; set; } = string.Empty;
    public int FieldCount { get; set; }
    public int HiddenFieldCount { get; set; }
    public int ErrorCount { get; set; }
    public int WarningCount { get; set; }
}

sealed class ThemeContractSummary
{
    public bool Present { get; set; }
    public bool DotNetDeserialized { get; set; }
    public int TokenCategoryCount { get; set; }
    public int SectionVariantCount { get; set; }
    public int ApprovedClassCount { get; set; }
    public int ErrorCount { get; set; }
    public int WarningCount { get; set; }
}

sealed class MediaRequirementSummary
{
    public string File { get; set; } = string.Empty;
    public int RequirementCount { get; set; }
    public int BlockerCount { get; set; }
}

sealed class StateCityGenerationPolicy
{
    public string RoutePattern { get; set; } = "/state-city";
    public List<string> Examples { get; set; } = new();
    public bool RequiresDotNetPageClasses { get; set; }
    public bool CreatedPageInThisPhase { get; set; }
    public string Notes { get; set; } = string.Empty;
}
