# Implementation Scope

Phase 2A-1 is an offline validator foundation only.

## In Scope

- Read a local tenant import package folder.
- Discover required package files.
- Discover at least one `pages/*.json` file.
- Load approved import package schemas from `../import-package-spec/schemas/`.
- Parse JSON and report invalid or empty files.
- Validate parsed files against matching schemas.
- Perform minimal cross-file checks:
  - `manifest.json.tenantId` matches `tenant.json.tenantId`
  - `manifest.json.siteKey` matches `tenant.json.siteKey`
  - `site.json.tenantId` matches `tenant.json.tenantId`
  - `site.json.siteKey` matches `tenant.json.siteKey`
  - page routes are listed in `routes.json.approvedRoutes`
  - each approved route has one page file
- Run offline URL safety and secret-pattern checks without printing secret values.
- Write machine-readable and human-readable reports.
- Provide tests and fake fixtures.

## Out of Scope

- CMS writes
- MediaAsset writes
- tenant creation
- content import
- Azure, Cloudflare, DNS, deployment, Function App setting, email, Microsoft 365, Search Console, or indexing actions
- external HTTP checks
- protected config reads
- Admin UI wizard implementation
- plugin runtime implementation
- deployment profile automation
- Roller work
