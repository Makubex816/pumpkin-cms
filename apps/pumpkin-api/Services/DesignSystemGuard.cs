using System.Text.Json;
using System.Text.RegularExpressions;
using pumpkin_net_models.Models;

namespace pumpkin_api.Services;

public record DesignSystemGuardIssue(string Severity, string Code, string Message, string Path);

public class DesignSystemGuardResult
{
    public bool Ok => Errors.Count == 0;
    public List<DesignSystemGuardIssue> Errors { get; } = new();
    public List<DesignSystemGuardIssue> Warnings { get; } = new();
}

public static class DesignSystemGuard
{
    private static readonly HashSet<string> Profiles = new(StringComparer.OrdinalIgnoreCase)
    {
        "marketing-basic",
        "marketing-rich",
        "media-rich",
        "table-rich",
        "layout-rich"
    };

    private static readonly HashSet<string> Containers = new(StringComparer.Ordinal)
    {
        "standard",
        "wide",
        "fullBleed",
        "none"
    };

    private static readonly HashSet<string> Variants = new(StringComparer.Ordinal)
    {
        "premium-hero",
        "split-feature",
        "trust-band",
        "event-card-grid",
        "service-area-grid",
        "quote-form-panel",
        "contact-card",
        "inline-contact",
        "compact-contact",
        "faq-panel",
        "media-feature",
        "table-comparison",
        "final-cta"
    };

    private static readonly HashSet<string> Providers = new(StringComparer.Ordinal)
    {
        "youtube",
        "vimeo",
        "googleMaps"
    };

    private static readonly HashSet<string> FormBlockVariants = new(StringComparer.Ordinal)
    {
        "quote-form-panel",
        "contact-card",
        "inline-contact",
        "compact-contact"
    };

    private static readonly HashSet<string> FormFieldTypes = new(StringComparer.Ordinal)
    {
        "text",
        "email",
        "tel",
        "textarea",
        "select",
        "checkbox",
        "hidden",
        "dateText",
        "number"
    };

    private static readonly HashSet<string> BlockedTags = new(StringComparer.OrdinalIgnoreCase)
    {
        "script",
        "style",
        "iframe",
        "object",
        "embed",
        "svg",
        "canvas",
        "form",
        "input",
        "button",
        "textarea",
        "select",
        "option",
        "link",
        "meta",
        "html",
        "head",
        "body",
        "base",
        "noscript",
        "template"
    };

    private static readonly Dictionary<string, HashSet<string>> ProfileTags = new(StringComparer.OrdinalIgnoreCase)
    {
        ["marketing-basic"] = new(StringComparer.OrdinalIgnoreCase) { "h2", "h3", "h4", "p", "span", "strong", "em", "br", "ul", "ol", "li", "a" },
        ["marketing-rich"] = new(StringComparer.OrdinalIgnoreCase) { "section", "div", "article", "aside", "h2", "h3", "h4", "p", "span", "strong", "em", "br", "ul", "ol", "li", "a", "blockquote" },
        ["media-rich"] = new(StringComparer.OrdinalIgnoreCase) { "section", "div", "article", "aside", "h2", "h3", "h4", "p", "span", "strong", "em", "br", "ul", "ol", "li", "a", "img", "figure", "figcaption", "picture", "source", "blockquote" },
        ["table-rich"] = new(StringComparer.OrdinalIgnoreCase) { "section", "div", "h2", "h3", "h4", "p", "span", "strong", "em", "br", "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption", "ul", "ol", "li", "a" },
        ["layout-rich"] = new(StringComparer.OrdinalIgnoreCase) { "section", "div", "article", "aside", "h2", "h3", "h4", "p", "span", "strong", "em", "br", "ul", "ol", "li", "a", "img", "figure", "figcaption", "picture", "source", "blockquote", "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption" }
    };

    private static readonly string[] ApprovedClassPrefixes =
    {
        "cms-",
        "section-",
        "card-",
        "cta-",
        "trust-",
        "grid-",
        "media-",
        "rich-",
        "ice-"
    };

    private static readonly HashSet<string> TailwindVariantPrefixes = new(StringComparer.Ordinal)
    {
        "sm",
        "md",
        "lg",
        "xl",
        "2xl",
        "hover",
        "focus",
        "focus-visible",
        "active",
        "visited",
        "disabled",
        "group-hover",
        "group-focus",
        "peer-checked",
        "dark",
        "motion-safe",
        "motion-reduce",
        "portrait",
        "landscape",
        "print"
    };

    private static readonly HashSet<string> TailwindExactUtilities = new(StringComparer.Ordinal)
    {
        "block",
        "inline-block",
        "inline",
        "flex",
        "inline-flex",
        "grid",
        "inline-grid",
        "contents",
        "hidden",
        "relative",
        "absolute",
        "fixed",
        "sticky",
        "static",
        "container",
        "sr-only",
        "not-sr-only",
        "visible",
        "invisible",
        "collapse",
        "isolate",
        "isolation-auto",
        "antialiased",
        "subpixel-antialiased",
        "truncate",
        "clearfix"
    };

    private static readonly Regex[] TailwindUtilityPatterns =
    {
        new("^-?(?:m|mx|my|mt|mr|mb|ml|p|px|py|pt|pr|pb|pl)-", RegexOptions.Compiled),
        new("^(?:w|h|min-w|min-h|max-w|max-h)-", RegexOptions.Compiled),
        new("^(?:text|bg|from|via|to|decoration|accent|caret|fill|stroke|placeholder|border|divide|ring|outline)-", RegexOptions.Compiled),
        new("^(?:rounded|shadow|opacity|z|order|col|row|basis|grow|shrink|gap|gap-x|gap-y|space-x|space-y)-", RegexOptions.Compiled),
        new("^(?:items|justify|content|self|place-items|place-content|place-self)-", RegexOptions.Compiled),
        new("^(?:font|leading|tracking|align|whitespace|break|hyphens|list|underline|no-underline|uppercase|lowercase|capitalize|normal-case)", RegexOptions.Compiled),
        new("^(?:overflow|overscroll|object|inset|top|right|bottom|left)-", RegexOptions.Compiled),
        new("^(?:grid-cols|grid-rows|auto-cols|auto-rows|col-span|row-span)-", RegexOptions.Compiled),
        new("^(?:flex|table|flow-root|clear|float|box|line-clamp)-", RegexOptions.Compiled),
        new("^(?:transition|duration|ease|delay|animate|transform|scale|rotate|translate|skew|origin)-", RegexOptions.Compiled),
        new("^(?:filter|blur|brightness|contrast|drop-shadow|grayscale|hue-rotate|invert|saturate|sepia|backdrop)-", RegexOptions.Compiled),
        new("^(?:cursor|select|resize|appearance|pointer-events|touch|scroll|snap)-", RegexOptions.Compiled),
        new("^(?:aria|data)-", RegexOptions.Compiled),
        new("^\\[.+\\]$", RegexOptions.Compiled)
    };

    private static readonly string[] IceLaunchRoutes =
    {
        "/",
        "/service-areas",
        "/contact"
    };

    public static DesignSystemGuardResult ValidatePage(Page page)
    {
        var result = new DesignSystemGuardResult();
        var blocks = page.ContentData?.ContentBlocks ?? new List<HtmlBlockBase>();
        var formKeys = new HashSet<string>(StringComparer.Ordinal)
        {
            "default-contact",
            "default-quote-request"
        };

        foreach (var definition in page.FormDefinitions ?? new List<FormDefinition>())
        {
            if (!string.IsNullOrWhiteSpace(definition.FormKey))
            {
                formKeys.Add(definition.FormKey);
            }
            ValidateFormDefinition(definition, $"formDefinitions[{(page.FormDefinitions ?? new List<FormDefinition>()).IndexOf(definition)}]", result);
        }

        for (var index = 0; index < blocks.Count; index++)
        {
            var block = blocks[index];
            if (!HtmlBlockFactory.GetSupportedBlockTypes().Contains(block.Type))
            {
                Error(result, "blocks.unknownType", $"Unsupported content block type \"{block.Type}\".", $"ContentData.ContentBlocks[{index}].type");
            }

            if (block.Type == "customHtml")
            {
                ValidateCustomHtmlBlock(block, $"ContentData.ContentBlocks[{index}].content", result);
            }
            else if (block.Type == "trustedEmbed")
            {
                ValidateTrustedEmbedBlock(block, $"ContentData.ContentBlocks[{index}].content", result);
            }
            else if (block.Type == "formBlock")
            {
                ValidateFormBlock(block, formKeys, $"ContentData.ContentBlocks[{index}].content", result);
            }
        }

        var requiresVisibleForm = page.PageSlug.Equals("contact", StringComparison.OrdinalIgnoreCase) ||
                                  string.Equals(page.Template?.TemplateKey, "contact", StringComparison.OrdinalIgnoreCase);
        if (requiresVisibleForm && blocks.All(block => block.Type != "formBlock"))
        {
            Error(result, "contact.formBlock.missing", "Contact pages must include a visible formBlock section.", "ContentData.ContentBlocks");
        }

        return result;
    }

    public static DesignSystemGuardResult ValidateTheme(Theme theme, string tenantId)
    {
        var result = new DesignSystemGuardResult();
        var designSystem = theme.DesignSystem;
        if (designSystem != null)
        {
            if (!string.IsNullOrWhiteSpace(designSystem.DomainCss))
            {
                ValidateCss(designSystem.DomainCss, "domainCss", tenantId, string.Empty, "theme.designSystem.domainCss", result);
            }

            foreach (var item in designSystem.TemplateCss)
            {
                if (!Variants.Contains(item.Key))
                {
                    Warn(result, "theme.templateCss.variant", $"Template CSS key \"{item.Key}\" is not an approved section variant.", $"theme.designSystem.templateCss.{item.Key}");
                }
                ValidateCss(item.Value, "templateCss", tenantId, item.Key, $"theme.designSystem.templateCss.{item.Key}", result);
            }

            foreach (var category in designSystem.Tokens)
            {
                foreach (var token in category.Value)
                {
                    if (token.Value.ValueKind != JsonValueKind.String && token.Value.ValueKind != JsonValueKind.Number)
                    {
                        Error(result, "theme.tokens.value", $"Theme token \"{category.Key}.{token.Key}\" must be a string or number.", $"theme.designSystem.tokens.{category.Key}.{token.Key}");
                    }
                }
            }
        }

        ValidateNavigation(theme.Menu, tenantId, "theme.menu", result);
        return result;
    }

    private static void ValidateCustomHtmlBlock(HtmlBlockBase block, string path, DesignSystemGuardResult result)
    {
        using var document = JsonDocument.Parse(JsonSerializer.Serialize(block.Content));
        var root = document.RootElement;
        var id = GetString(root, "id");
        var profile = GetString(root, "allowedProfile");
        var container = GetString(root, "container");
        var sectionVariant = GetString(root, "sectionVariant");
        var html = GetString(root, "html");
        var css = GetString(root, "css");

        if (string.IsNullOrWhiteSpace(id))
        {
            Error(result, "customHtml.id", "customHtml sections require a stable id.", $"{path}.id");
        }

        if (string.IsNullOrWhiteSpace(profile))
        {
            profile = "marketing-basic";
        }
        else if (!Profiles.Contains(profile))
        {
            Error(result, "customHtml.profile", $"Unsupported allowedProfile \"{profile}\".", $"{path}.allowedProfile");
        }

        if (string.IsNullOrWhiteSpace(container))
        {
            container = "standard";
        }
        else if (!Containers.Contains(container))
        {
            Error(result, "customHtml.container", $"Unsupported container \"{container}\".", $"{path}.container");
        }

        if (!string.IsNullOrWhiteSpace(sectionVariant) && !Variants.Contains(sectionVariant))
        {
            Error(result, "customHtml.variant", $"Unsupported sectionVariant \"{sectionVariant}\".", $"{path}.sectionVariant");
        }

        ValidateHtml(html, profile, $"{path}.html", result);

        if (!string.IsNullOrWhiteSpace(css))
        {
            ValidateCss(css, "sectionScopedCss", string.Empty, NormalizeSectionId(id), $"{path}.css", result);
        }
    }

    private static void ValidateTrustedEmbedBlock(HtmlBlockBase block, string path, DesignSystemGuardResult result)
    {
        using var document = JsonDocument.Parse(JsonSerializer.Serialize(block.Content));
        var root = document.RootElement;
        var provider = GetString(root, "provider");
        var url = GetString(root, "url");
        var title = GetString(root, "title");
        var container = GetString(root, "container");

        if (!Providers.Contains(provider))
        {
            Error(result, "trustedEmbed.provider", $"Unsupported trustedEmbed provider \"{provider}\".", $"{path}.provider");
        }

        if (string.IsNullOrWhiteSpace(title))
        {
            Error(result, "trustedEmbed.title", "trustedEmbed title is required for accessibility.", $"{path}.title");
        }

        if (!string.IsNullOrWhiteSpace(container) && !Containers.Contains(container))
        {
            Error(result, "trustedEmbed.container", $"Unsupported container \"{container}\".", $"{path}.container");
        }

        if (!IsTrustedEmbedUrl(provider, url))
        {
            Error(result, "trustedEmbed.url", "trustedEmbed url must be an approved https provider URL.", $"{path}.url");
        }
    }

    private static void ValidateFormBlock(HtmlBlockBase block, HashSet<string> formKeys, string path, DesignSystemGuardResult result)
    {
        using var document = JsonDocument.Parse(JsonSerializer.Serialize(block.Content));
        var root = document.RootElement;
        var id = GetString(root, "id");
        var formKey = GetString(root, "formKey");
        var variant = GetString(root, "variant");
        var heading = GetString(root, "heading");
        var submitLabel = GetString(root, "submitLabel");
        var staticEndpointRef = GetString(root, "staticEndpointRef");
        var leadRecipientRef = GetString(root, "leadRecipientRef");
        var sourcePage = GetString(root, "sourcePage");

        if (string.IsNullOrWhiteSpace(id))
        {
            Error(result, "formBlock.id", "formBlock sections require a stable id.", $"{path}.id");
        }

        if (string.IsNullOrWhiteSpace(formKey))
        {
            Error(result, "formBlock.formKey", "formBlock requires formKey.", $"{path}.formKey");
        }
        else if (!formKeys.Contains(formKey))
        {
            Error(result, "formBlock.formKey.unknown", $"Unknown formKey \"{formKey}\".", $"{path}.formKey");
        }

        if (!FormBlockVariants.Contains(variant))
        {
            Error(result, "formBlock.variant", $"Unsupported formBlock variant \"{variant}\".", $"{path}.variant");
        }

        if (string.IsNullOrWhiteSpace(heading))
        {
            Error(result, "formBlock.heading", "formBlock heading is required.", $"{path}.heading");
        }

        if (string.IsNullOrWhiteSpace(submitLabel))
        {
            Error(result, "formBlock.submitLabel", "formBlock submitLabel is required.", $"{path}.submitLabel");
        }

        if (string.IsNullOrWhiteSpace(sourcePage))
        {
            Error(result, "formBlock.sourcePage", "formBlock sourcePage is required.", $"{path}.sourcePage");
        }

        ValidateSafeReference(staticEndpointRef, "formBlock.staticEndpointRef", $"{path}.staticEndpointRef", result);
        ValidateSafeReference(leadRecipientRef, "formBlock.leadRecipientRef", $"{path}.leadRecipientRef", result);

        if (ContainsSecretLike(root))
        {
            Error(result, "formBlock.secretLike", "Secret-like values are not allowed in formBlock configuration.", path);
        }
    }

    private static void ValidateFormDefinition(FormDefinition definition, string path, DesignSystemGuardResult result)
    {
        if (string.IsNullOrWhiteSpace(definition.Id))
        {
            Error(result, "form.id", "Form definition id is required.", $"{path}.id");
        }
        if (string.IsNullOrWhiteSpace(definition.TenantId))
        {
            Error(result, "form.tenantId", "Form definition tenantId is required.", $"{path}.tenantId");
        }
        if (string.IsNullOrWhiteSpace(definition.SiteKey))
        {
            Error(result, "form.siteKey", "Form definition siteKey is required.", $"{path}.siteKey");
        }
        if (string.IsNullOrWhiteSpace(definition.FormKey))
        {
            Error(result, "form.formKey", "Form definition formKey is required.", $"{path}.formKey");
        }
        if (definition.Status is not ("draft" or "active" or "archived"))
        {
            Error(result, "form.status", "Form status must be draft, active, or archived.", $"{path}.status");
        }
        if (definition.SubmitAction != "form-entry")
        {
            Error(result, "form.submitAction", "Default production forms must submit to FormEntry.", $"{path}.submitAction");
        }

        ValidateSafeReference(definition.StaticEndpointRef, "form.staticEndpointRef", $"{path}.staticEndpointRef", result);
        ValidateSafeReference(definition.LeadRecipientRef, "form.leadRecipientRef", $"{path}.leadRecipientRef", result);
        if (!string.IsNullOrWhiteSpace(definition.NotificationEmailRef))
        {
            ValidateSafeReference(definition.NotificationEmailRef, "form.notificationEmailRef", $"{path}.notificationEmailRef", result);
        }

        var names = new HashSet<string>(StringComparer.Ordinal);
        foreach (var field in definition.Fields.Concat(definition.HiddenFields))
        {
            var fieldPath = $"{path}.fields.{field.Name}";
            if (string.IsNullOrWhiteSpace(field.Name))
            {
                Error(result, "form.field.name", "Form field name is required.", fieldPath);
            }
            else if (!Regex.IsMatch(field.Name, "^[A-Za-z][A-Za-z0-9_-]{1,80}$"))
            {
                Error(result, "form.field.name", $"Invalid form field name \"{field.Name}\".", fieldPath);
            }

            if (!FormFieldTypes.Contains(field.Type))
            {
                Error(result, "form.field.type", $"Unsupported form field type \"{field.Type}\".", $"{fieldPath}.type");
            }

            if (field.Type == "select" && field.Options.Count == 0)
            {
                Error(result, "form.field.options", $"Select field \"{field.Name}\" requires options.", $"{fieldPath}.options");
            }

            if (!string.IsNullOrWhiteSpace(field.Name) && !names.Add(field.Name))
            {
                Error(result, "form.field.duplicate", $"Duplicate field name \"{field.Name}\".", fieldPath);
            }
        }

        if (!names.Contains("consent"))
        {
            Error(result, "form.consent", "Default forms must include a consent field.", $"{path}.fields");
        }
        if (!names.Contains("honeypot"))
        {
            Error(result, "form.honeypot", "Default forms must include a honeypot field.", $"{path}.fields");
        }
        if (!names.Contains("tenantId") || !names.Contains("siteKey") || !names.Contains("formKey") || !names.Contains("sourcePage"))
        {
            Error(result, "form.hiddenFields", "Default forms must include tenantId, siteKey, formKey, and sourcePage hidden fields.", $"{path}.hiddenFields");
        }

        if (ContainsSecretLike(JsonSerializer.SerializeToElement(definition)))
        {
            Error(result, "form.secretLike", "Secret-like values are not allowed in form definitions.", path);
        }
    }

    private static void ValidateHtml(string html, string profile, string path, DesignSystemGuardResult result)
    {
        var allowed = ProfileTags.TryGetValue(profile, out var tags) ? tags : ProfileTags["marketing-basic"];
        var index = 0;

        while (index < html.Length)
        {
            var start = html.IndexOf('<', index);
            if (start < 0) break;
            if (html.AsSpan(start).StartsWith("<!--", StringComparison.Ordinal))
            {
                var commentEnd = html.IndexOf("-->", start + 4, StringComparison.Ordinal);
                index = commentEnd >= 0 ? commentEnd + 3 : html.Length;
                continue;
            }

            var parsed = ParseTag(html, start);
            if (parsed == null)
            {
                Warn(result, "html.malformed", "Malformed HTML tag was found.", path);
                index = start + 1;
                continue;
            }

            index = parsed.EndIndex;
            if (BlockedTags.Contains(parsed.Name))
            {
                Error(result, "html.blockedTag", $"<{parsed.Name}> is not allowed in CMS customHtml.", path);
                continue;
            }

            if (!allowed.Contains(parsed.Name))
            {
                Error(result, "html.disallowedTag", $"<{parsed.Name}> is not allowed for {profile}.", path);
            }

            foreach (var attr in parsed.Attributes)
            {
                var attrName = attr.Name.ToLowerInvariant();
                var attrValue = attr.Value.Trim();

                if (attrName.StartsWith("on", StringComparison.OrdinalIgnoreCase) ||
                    attrName is "style" or "srcdoc" or "formaction" or "autofocus" or "contenteditable")
                {
                    Error(result, "html.blockedAttribute", $"Attribute \"{attrName}\" is not allowed.", path);
                }

                if ((attrName == "href" || attrName == "src") && IsUnsafeUrl(attrValue))
                {
                    Error(result, "html.unsafeUrl", $"{attrName} uses an unsafe URL scheme.", path);
                }

                if (attrName == "class")
                {
                    foreach (var className in attrValue.Split(' ', StringSplitOptions.RemoveEmptyEntries))
                    {
                        if (!IsApprovedClass(className))
                        {
                            if (IsTailwindUtilityLikeClass(className))
                            {
                                Error(result, "html.tailwindUtilityClass", $"Tailwind utility class \"{className}\" is not allowed in CMS customHtml unless it is explicitly registered. Use semantic CMS classes or sectionScopedCss.", path);
                            }
                            else
                            {
                                Warn(result, "html.unknownClass", $"Class \"{className}\" is not in the approved registry.", path);
                            }
                        }
                    }
                }
            }

            if (parsed.Name.Equals("img", StringComparison.OrdinalIgnoreCase))
            {
                var alt = parsed.Attributes.FirstOrDefault(item => item.Name.Equals("alt", StringComparison.OrdinalIgnoreCase));
                var role = parsed.Attributes.FirstOrDefault(item => item.Name.Equals("role", StringComparison.OrdinalIgnoreCase));
                if (alt == null)
                {
                    Warn(result, "html.imageAlt", "Images should include alt text or alt=\"\" with role=\"presentation\".", path);
                }
                else if (alt.Value == string.Empty && role?.Value != "presentation")
                {
                    Warn(result, "html.decorativeImage", "Decorative images should use alt=\"\" with role=\"presentation\".", path);
                }
            }
        }
    }

    private static void ValidateCss(string css, string mode, string tenantId, string scope, string path, DesignSystemGuardResult result)
    {
        if (Regex.IsMatch(css, "@import\\b|@font-face\\b|expression\\s*\\(|-moz-binding\\s*:|behavior\\s*:|</?script\\b", RegexOptions.IgnoreCase))
        {
            Error(result, "css.blocked", "CMS-authored CSS contains a blocked directive or script-like string.", path);
        }

        if (Regex.IsMatch(css, "url\\s*\\(\\s*['\"]?\\s*(javascript|data|file|blob):", RegexOptions.IgnoreCase))
        {
            Error(result, "css.unsafeUrl", "CMS-authored CSS contains an unsafe url() scheme.", path);
        }

        if (Regex.IsMatch(css, "(^|[,\\s])(?:html|body)\\b|#__next\\b", RegexOptions.IgnoreCase))
        {
            Error(result, "css.globalSelector", "Content CSS cannot target html, body, or #__next.", path);
        }

        if (mode == "sectionScopedCss")
        {
            var normalizedScope = NormalizeSectionId(scope);
            foreach (var selector in ExtractSelectors(css))
            {
                var trimmed = selector.Trim();
                if (trimmed.StartsWith("@", StringComparison.Ordinal)) continue;
                if (!trimmed.StartsWith($"[data-section-id=\"{normalizedScope}\"]", StringComparison.Ordinal) &&
                    !trimmed.StartsWith($"[data-section-id='{normalizedScope}']", StringComparison.Ordinal) &&
                    !trimmed.StartsWith($".section-{normalizedScope}", StringComparison.Ordinal))
                {
                    Error(result, "css.sectionScope", $"sectionScopedCss selector \"{trimmed}\" must be scoped to {normalizedScope}.", path);
                }
            }
        }

        if (mode == "domainCss" && !string.IsNullOrWhiteSpace(tenantId))
        {
            var normalizedTenant = NormalizeSectionId(tenantId);
            foreach (var selector in ExtractSelectors(css))
            {
                var trimmed = selector.Trim();
                if (trimmed.StartsWith("@", StringComparison.Ordinal)) continue;
                if (!trimmed.StartsWith($"[data-tenant-id=\"{normalizedTenant}\"]", StringComparison.Ordinal) &&
                    !trimmed.StartsWith($"[data-tenant-id='{normalizedTenant}']", StringComparison.Ordinal) &&
                    !trimmed.StartsWith($".tenant-{normalizedTenant}", StringComparison.Ordinal))
                {
                    Error(result, "css.domainScope", $"domainCss selector \"{trimmed}\" must be scoped to {normalizedTenant}.", path);
                }
            }
        }

        foreach (var selector in ExtractSelectors(css))
        {
            foreach (Match match in Regex.Matches(selector, "\\.([A-Za-z_][A-Za-z0-9_-]*)"))
            {
                var className = match.Groups[1].Value;
                if (IsApprovedClass(className)) continue;
                if (IsTailwindUtilityLikeClass(className))
                {
                    Error(result, "css.tailwindUtilityClass", $"Selector class \"{className}\" looks like a Tailwind utility and is not allowed in CMS-authored CSS unless explicitly registered.", path);
                }
                else
                {
                    Warn(result, "css.unknownClass", $"Selector class \"{className}\" is not in the approved registry.", path);
                }
            }
        }

        if (Regex.IsMatch(css, "!important|position\\s*:\\s*fixed|animation(?:-[a-z-]+)?\\s*:|transform\\s*:|filter\\s*:|clip-path\\s*:", RegexOptions.IgnoreCase))
        {
            Warn(result, "css.review", "CMS-authored CSS contains properties that need design review.", path);
        }
    }

    private static void ValidateNavigation(List<MenuItem> menu, string tenantId, string path, DesignSystemGuardResult result)
    {
        var visibleTopLevelRoutes = new HashSet<string>(StringComparer.Ordinal);
        for (var index = 0; index < menu.Count; index++)
        {
            ValidateNavigationItem(menu[index], $"{path}[{index}]", result);
            if (menu[index].IsVisible && IsInternalNavigationUrl(menu[index].Url))
            {
                visibleTopLevelRoutes.Add(StripHash(menu[index].Url));
            }
        }

        if (!tenantId.Equals("ice-rink-rentals", StringComparison.Ordinal)) return;

        foreach (var route in IceLaunchRoutes)
        {
            if (!visibleTopLevelRoutes.Contains(route))
            {
                Warn(result, "navigation.route.missing", $"Ice primary navigation does not include expected launch route \"{route}\".", path);
            }
        }
    }

    private static void ValidateNavigationItem(MenuItem item, string path, DesignSystemGuardResult result)
    {
        if (string.IsNullOrWhiteSpace(item.Label))
        {
            Error(result, "navigation.label", "Navigation items require a label.", $"{path}.label");
        }

        if (string.IsNullOrWhiteSpace(item.Url))
        {
            Error(result, "navigation.url", "Navigation items require a URL.", $"{path}.url");
        }
        else if (!IsSafeNavigationUrl(item.Url))
        {
            Error(result, "navigation.url.unsafe", $"Navigation URL \"{item.Url}\" is not allowed.", $"{path}.url");
        }

        if (item.Target is not ("_self" or "_blank"))
        {
            Error(result, "navigation.target", "Navigation target must be \"_self\" or \"_blank\".", $"{path}.target");
        }

        for (var childIndex = 0; childIndex < item.Children.Count; childIndex++)
        {
            ValidateNavigationItem(item.Children[childIndex], $"{path}.children[{childIndex}]", result);
        }
    }

    private static bool IsApprovedClass(string className)
    {
        return ApprovedClassPrefixes.Any(prefix => className.StartsWith(prefix, StringComparison.Ordinal));
    }

    private static bool IsTailwindUtilityLikeClass(string className)
    {
        var normalized = className.Trim().TrimStart('!');
        if (string.IsNullOrWhiteSpace(normalized)) return false;

        var parts = normalized.Split(':', StringSplitOptions.RemoveEmptyEntries);
        var candidate = (parts.LastOrDefault() ?? normalized).TrimStart('!');
        var hasTailwindVariant = parts.Length > 1 && parts.Take(parts.Length - 1).Any(part => TailwindVariantPrefixes.Contains(part) || Regex.IsMatch(part, "^\\[.+\\]$"));
        if (hasTailwindVariant) return true;
        if (TailwindExactUtilities.Contains(candidate)) return true;
        return TailwindUtilityPatterns.Any(pattern => pattern.IsMatch(candidate));
    }

    private static bool IsSafeNavigationUrl(string url)
    {
        var trimmed = url.Trim();
        var lower = trimmed.ToLowerInvariant();
        if (lower.StartsWith("//", StringComparison.Ordinal)) return false;
        if (lower.StartsWith("#", StringComparison.Ordinal) || lower.StartsWith("/", StringComparison.Ordinal)) return true;
        if (lower.StartsWith("mailto:", StringComparison.Ordinal) || lower.StartsWith("tel:", StringComparison.Ordinal)) return true;
        if (lower.StartsWith("javascript:", StringComparison.Ordinal) ||
            lower.StartsWith("data:", StringComparison.Ordinal) ||
            lower.StartsWith("vbscript:", StringComparison.Ordinal) ||
            lower.StartsWith("file:", StringComparison.Ordinal) ||
            lower.StartsWith("blob:", StringComparison.Ordinal))
        {
            return false;
        }

        return Uri.TryCreate(trimmed, UriKind.Absolute, out var uri) && uri.Scheme == Uri.UriSchemeHttps;
    }

    private static bool IsInternalNavigationUrl(string url)
    {
        var trimmed = url.Trim();
        return trimmed.StartsWith("/", StringComparison.Ordinal) && !trimmed.StartsWith("//", StringComparison.Ordinal);
    }

    private static string StripHash(string url)
    {
        var trimmed = url.Trim();
        if (!trimmed.StartsWith("/", StringComparison.Ordinal)) return trimmed;
        var hashIndex = trimmed.IndexOf('#', StringComparison.Ordinal);
        return hashIndex >= 0 ? (hashIndex == 0 ? "/" : trimmed[..hashIndex]) : trimmed;
    }

    private static List<string> ExtractSelectors(string css)
    {
        var selectors = new List<string>();
        var start = 0;
        for (var index = 0; index < css.Length; index++)
        {
            if (css[index] != '{') continue;
            selectors.AddRange(css[start..index].Split(',', StringSplitOptions.RemoveEmptyEntries));
            var close = css.IndexOf('}', index + 1);
            if (close < 0) break;
            start = close + 1;
            index = close;
        }
        return selectors;
    }

    private static bool IsTrustedEmbedUrl(string provider, string value)
    {
        if (!Uri.TryCreate(value, UriKind.Absolute, out var uri) || uri.Scheme != Uri.UriSchemeHttps)
        {
            return false;
        }

        var host = uri.Host.StartsWith("www.", StringComparison.OrdinalIgnoreCase) ? uri.Host[4..] : uri.Host;
        return provider switch
        {
            "youtube" => host is "youtube.com" or "m.youtube.com" or "youtu.be",
            "vimeo" => host is "vimeo.com" or "player.vimeo.com",
            "googleMaps" => (host is "google.com" or "maps.google.com") && uri.AbsolutePath.Contains("/maps", StringComparison.OrdinalIgnoreCase),
            _ => false
        };
    }

    private static bool IsUnsafeUrl(string value)
    {
        var lower = value.Trim().ToLowerInvariant();
        return lower.StartsWith("javascript:", StringComparison.Ordinal) ||
               lower.StartsWith("data:", StringComparison.Ordinal) ||
               lower.StartsWith("vbscript:", StringComparison.Ordinal) ||
               lower.StartsWith("file:", StringComparison.Ordinal) ||
               lower.StartsWith("blob:", StringComparison.Ordinal);
    }

    private static void ValidateSafeReference(string value, string code, string path, DesignSystemGuardResult result)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            Error(result, code, "Non-secret reference name is required.", path);
            return;
        }

        if (!Regex.IsMatch(value, "^[A-Z0-9_:-]{3,160}$"))
        {
            Error(result, code, "Reference values must be non-secret names, not URLs or credentials.", path);
        }
    }

    private static bool ContainsSecretLike(JsonElement element)
    {
        switch (element.ValueKind)
        {
            case JsonValueKind.String:
                var value = element.GetString() ?? string.Empty;
                return Regex.IsMatch(value, "\\bBearer\\s+[A-Za-z0-9._~-]+|\\beyJ[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\b|\\bsk-[A-Za-z0-9]{20,}\\b|\\b(AccountKey|SharedAccessKey|DefaultEndpointsProtocol|EndpointSuffix)=", RegexOptions.IgnoreCase);
            case JsonValueKind.Array:
                return element.EnumerateArray().Any(ContainsSecretLike);
            case JsonValueKind.Object:
                return element.EnumerateObject().Any(property => ContainsSecretLike(property.Value));
            default:
                return false;
        }
    }

    private static string GetString(JsonElement element, string property)
    {
        if (!element.TryGetProperty(property, out var value)) return string.Empty;
        return value.ValueKind == JsonValueKind.String ? value.GetString() ?? string.Empty : value.ToString();
    }

    private static string NormalizeSectionId(string value)
    {
        var normalized = Regex.Replace((value ?? string.Empty).Trim().ToLowerInvariant(), "[^a-z0-9_-]+", "-");
        normalized = Regex.Replace(normalized, "-+", "-").Trim('-');
        return string.IsNullOrWhiteSpace(normalized) ? "custom-html-section" : normalized;
    }

    private static ParsedTag? ParseTag(string input, int start)
    {
        var index = start + 1;
        var quote = '\0';
        while (index < input.Length)
        {
            var current = input[index];
            if (quote != '\0')
            {
                if (current == quote) quote = '\0';
            }
            else if (current is '"' or '\'')
            {
                quote = current;
            }
            else if (current == '>')
            {
                break;
            }
            index++;
        }

        if (index >= input.Length || input[index] != '>') return null;
        var body = input[(start + 1)..index].Trim();
        if (body.StartsWith("/", StringComparison.Ordinal)) body = body[1..].Trim();
        if (body.EndsWith("/", StringComparison.Ordinal)) body = body[..^1].Trim();
        var nameMatch = Regex.Match(body, "^([A-Za-z][A-Za-z0-9-]*)");
        if (!nameMatch.Success) return null;
        var name = nameMatch.Groups[1].Value;
        var attrs = ParseAttributes(body[name.Length..]);
        return new ParsedTag(name, attrs, index + 1);
    }

    private static List<ParsedAttribute> ParseAttributes(string input)
    {
        var attributes = new List<ParsedAttribute>();
        var index = 0;
        while (index < input.Length)
        {
            while (index < input.Length && char.IsWhiteSpace(input[index])) index++;
            if (index >= input.Length) break;
            var nameStart = index;
            while (index < input.Length && !char.IsWhiteSpace(input[index]) && input[index] != '=') index++;
            var name = input[nameStart..index].Trim();
            while (index < input.Length && char.IsWhiteSpace(input[index])) index++;
            var value = string.Empty;
            if (index < input.Length && input[index] == '=')
            {
                index++;
                while (index < input.Length && char.IsWhiteSpace(input[index])) index++;
                var quote = index < input.Length && (input[index] == '"' || input[index] == '\'') ? input[index++] : '\0';
                var valueStart = index;
                while (index < input.Length && ((quote != '\0' && input[index] != quote) || (quote == '\0' && !char.IsWhiteSpace(input[index])))) index++;
                value = input[valueStart..index];
                if (quote != '\0' && index < input.Length) index++;
            }
            if (!string.IsNullOrWhiteSpace(name)) attributes.Add(new ParsedAttribute(name, value));
        }
        return attributes;
    }

    private static void Error(DesignSystemGuardResult result, string code, string message, string path)
    {
        result.Errors.Add(new DesignSystemGuardIssue("error", code, message, path));
    }

    private static void Warn(DesignSystemGuardResult result, string code, string message, string path)
    {
        result.Warnings.Add(new DesignSystemGuardIssue("warning", code, message, path));
    }

    private sealed record ParsedTag(string Name, List<ParsedAttribute> Attributes, int EndIndex);
    private sealed record ParsedAttribute(string Name, string Value);
}
