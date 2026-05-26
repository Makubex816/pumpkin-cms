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

    public static DesignSystemGuardResult ValidatePage(Page page)
    {
        var result = new DesignSystemGuardResult();
        var blocks = page.ContentData?.ContentBlocks ?? new List<HtmlBlockBase>();

        for (var index = 0; index < blocks.Count; index++)
        {
            var block = blocks[index];
            if (block.Type == "customHtml")
            {
                ValidateCustomHtmlBlock(block, $"ContentData.ContentBlocks[{index}].content", result);
            }
            else if (block.Type == "trustedEmbed")
            {
                ValidateTrustedEmbedBlock(block, $"ContentData.ContentBlocks[{index}].content", result);
            }
        }

        return result;
    }

    public static DesignSystemGuardResult ValidateTheme(Theme theme, string tenantId)
    {
        var result = new DesignSystemGuardResult();
        var designSystem = theme.DesignSystem;
        if (designSystem == null)
        {
            return result;
        }

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
                        if (!ApprovedClassPrefixes.Any(prefix => className.StartsWith(prefix, StringComparison.Ordinal)))
                        {
                            Warn(result, "html.unknownClass", $"Class \"{className}\" is not in the approved registry.", path);
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

        if (Regex.IsMatch(css, "!important|position\\s*:\\s*fixed|animation(?:-[a-z-]+)?\\s*:|transform\\s*:|filter\\s*:|clip-path\\s*:", RegexOptions.IgnoreCase))
        {
            Warn(result, "css.review", "CMS-authored CSS contains properties that need design review.", path);
        }
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
