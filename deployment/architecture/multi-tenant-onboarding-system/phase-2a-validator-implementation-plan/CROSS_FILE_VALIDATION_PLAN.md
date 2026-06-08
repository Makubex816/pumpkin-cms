# Cross-File Validation Plan

Cross-file checks cannot be fully expressed in JSON Schema. Phase 2A should implement them as deterministic offline validators.

## Tenant and Site Consistency

Check:

- every JSON file has the same `tenantId`
- every JSON file has the same `siteKey`
- `tenant.json.cmsTenantSlug` matches or maps explicitly to `siteKey`
- `manifest.json.tenantId` and `manifest.json.siteKey` match package documents
- `owner-contacts.json`, `approvals.json`, and report files match tenant scope

## Routes and Pages

Check:

- every page route appears in `routes.json.approvedRoutes`
- every approved route has exactly one page file unless explicitly marked no-page in future schema
- forbidden routes do not appear as page routes
- forbidden routes do not appear in theme navigation
- redirects do not point to forbidden routes
- page slug and route relationship is consistent with route policy
- `/` is represented by home page

## Media References

Check:

- every media ID referenced by page blocks exists in `media-assets.json`
- every media asset uses the package `tenantId` and `siteKey`
- unused media is warning, not failure, unless `--strict`
- media domain matches `site.json.mediaDomain` for production-ready fields

## Form References

Check:

- every form ID referenced by page blocks exists in `forms.json`
- every form recipient has an owner in `owner-contacts.json` or form mailbox owner field
- delivery mode is compatible with selected deployment profile
- no page references unknown form IDs

## SEO and Canonical

Check:

- page canonical URL host aligns with `site.json.canonicalHost`
- canonical path aligns with page route
- `seo.json.canonicalBaseUrl` matches canonical host policy
- sitemap policy aligns with routes
- sitemap URLs, when present in future fixtures, match canonical URLs
- no production canonical points to staging/default-host/local URLs
- no Search Console metadata is treated as approval

## Deployment Profile

Check:

- `site.json.deploymentProfileId` exists in deployment profile registry
- profile supports the tenant or declares tenant-agnostic support in a future registry format
- required validators named by profile are known
- profile `indexingFinalGate` is true

## Cross-Tenant and Paused Tenant Guards

Check:

- package text does not reference unrelated tenant IDs/site keys except in allowed `relatedTenants` fields
- paused tenants are not included in approved routes, media IDs, forms, theme navigation, or redirects
- Roller remains paused unless a future package explicitly targets Roller under separate approval

