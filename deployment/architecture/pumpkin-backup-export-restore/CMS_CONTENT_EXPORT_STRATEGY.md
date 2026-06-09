# CMS Content Export Strategy

## Tenant Export

Tenant-scoped CMS export should include:

- tenant/site metadata;
- pages and page versions;
- route map;
- navigation/menu data;
- form definitions without secret delivery credentials;
- SEO metadata;
- redirect rules;
- theme references;
- validation evidence.

## Full Platform Export

Full platform export should include tenant index and tenant-scoped content groups without merging unrelated tenants. Cross-tenant references should be explicit and validated.

## Content Formats

Use structured JSON for machine restore and Markdown summaries for human review. Every content file must be checksummed and schema-versioned.

## Restore Expectations

Readback verification must compare:

- tenant/site identity;
- page count and page slugs;
- route table;
- sitemap inclusion flags;
- form definitions;
- SEO/canonical/robots fields;
- redirect rules;
- theme references.

## Hard Stops

CMS content export is read-only. Restore/import is a separate approval and cannot happen during backup creation.
