# Local Scanner

The local scanner reads fixture JSON and walks string fields recursively. It extracts URL candidates from:

- declared link fields such as `url`, `href`, `link`, `ctaUrl`, and `externalUrl`;
- bare `http` and `https` URLs;
- markdown links;
- HTML-like anchor snippets;
- navigation, footer, theme, form, and content block fixture data.

The scanner records:

- tenant and site scope;
- page id when available;
- content type;
- content block id when available;
- field name;
- anchor text;
- deterministic location path;
- extraction type.

It does not fetch URLs, perform DNS lookups, follow redirects, read protected config, or call live services.
