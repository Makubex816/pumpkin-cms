# SEO JSON Expectations

`seo.json` defines page SEO defaults and indexing readiness.

Required:

- `schemaVersion`
- `tenantId`
- `siteKey`
- `defaultRobots`
- `canonicalBaseUrl`
- `sitemapPolicy`

Rules:

- Approved production pages should use `index,follow` only after readiness gates allow it.
- Sitemap URLs must match canonical URLs.
- Search Console/indexing remains a final gate and is never triggered by this file.

