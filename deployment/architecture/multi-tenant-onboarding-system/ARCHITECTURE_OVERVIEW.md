# Architecture Overview

## Layers

| Layer | Responsibility |
| --- | --- |
| Intake | Human-readable forms for business, domain, pages, media, forms, legal, analytics, and approvals. |
| Import package | JSON files that describe tenant, site, routes, pages, media, forms, SEO, theme, redirects, and manifest. |
| Schema validation | JSON Schema checks plus cross-file consistency rules. |
| CMS preview | Read/write gate for importing a tenant package into a reviewable CMS state. |
| Static/export validation | Route whitelist, obsolete route exclusion, noindex/canonical/sitemap/robots, hidden payload, generated artifact, and secret checks. |
| Media readiness | Verifies production media URL shape and delivery profile requirements. |
| Form readiness | Verifies endpoint configuration and safe preflight behavior without sending live leads unless approved. |
| Staging | Deploys or previews through the selected deployment profile after explicit approval. |
| Production cutover | Binds domains/DNS/hosting only after staging and smoke gates pass. |
| Owner review | Captures content, legal, form, analytics, monitoring, and rollback signoff. |
| Final indexing | Search Console and indexing work, always last and always explicitly approved. |

## Data Flow

1. User fills intake forms.
2. Operator or future wizard generates an import package.
3. Validators check schemas, tenant scope, routes, URLs, secrets, forbidden fields, and completeness.
4. CMS import creates or updates records only under explicit approval.
5. Preview and static export prove the site can render only approved routes.
6. Deployment profile gates verify media, forms, staging, production, rollback, and monitoring.
7. Manual owner review records the human go/no-go.
8. Search Console/indexing remains blocked until final approval.

## Trust Boundaries

Tenant data may move from intake to JSON to CMS to generated artifacts. Secrets never move through those files. Secrets live only in approved runtime secret stores or operator shells and are never printed, committed, or included in support packets.

