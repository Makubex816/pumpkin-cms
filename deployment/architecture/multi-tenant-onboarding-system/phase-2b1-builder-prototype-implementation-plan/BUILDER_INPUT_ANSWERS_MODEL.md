# Builder Input Answers Model

## Answers File Purpose

The answers file is the prototype's draft input. It is easier for operators to prepare than hand-written import package JSON, but still structured enough for deterministic generation and tests.

## Required Top-Level Groups

- `schemaVersion`
- `builderProfile`
- `tenant`
- `domains`
- `routing`
- `pages`
- `media`
- `form`
- `seo`
- `analyticsDecision`
- `privacyReviewStatus`
- `ownerContacts`
- `manualApprovals`

## Required Fields

| Answers field | Purpose | Generated destination |
| --- | --- | --- |
| `tenant.tenantDisplayName` | Business display name. | `tenant.json.displayName` |
| `tenant.tenantId` | Stable tenant ID. | every scoped JSON file |
| `tenant.siteKey` | Stable site key. | every scoped JSON file |
| `tenant.businessType` | Business category. | `tenant.json.businessType` |
| `tenant.cmsTenantSlug` | Future CMS slug reference. | `tenant.json.cmsTenantSlug` |
| `domains.primaryDomain` | Main production domain. | `site.json.primaryDomain` |
| `domains.wwwDomain` | WWW domain. | `site.json.wwwDomain` |
| `domains.mediaDomain` | Public media domain. | `site.json.mediaDomain` |
| `domains.canonicalHost` | Primary or www canonical policy. | `site.json.canonicalHost`, `seo.json.canonicalBaseUrl` |
| `routing.trailingSlashPolicy` | Route normalization policy. | generator behavior |
| `routing.approvedRoutes` | Launch route allowlist. | `routes.json.approvedRoutes`, `pages/*.json` |
| `routing.forbiddenRoutes` | Routes that must not launch. | `routes.json.forbiddenRoutes` |
| `builderProfile.deploymentProfile` | Intended deployment profile. | `site.json.deploymentProfileId` |
| `pages[]` | Page metadata and content placeholders. | `pages/*.json`, `theme.json` |
| `media[]` | Media manifest metadata. | `media-assets.json` |
| `form` | Contact form metadata. | `forms.json`, page blocks |
| `seo` | Canonical, robots, sitemap, final indexing gate. | `seo.json`, page SEO |
| `analyticsDecision` | Analytics decision record. | future `approvals.json` or support packet |
| `privacyReviewStatus` | Legal/privacy status. | future `approvals.json` or support packet |
| `ownerContacts` | Responsible owners. | future `owner-contacts.json` |
| `manualApprovals` | Manual gate status records. | future `approvals.json` |

## Validation Rules

- Answers JSON must parse before any generation step.
- `schemaVersion` must be `1.0.0`.
- Tenant ID, site key, CMS slug, media IDs, form IDs, and page slugs must be lowercase stable IDs.
- Domains must be public domain names, not localhost, private network addresses, staging hosts as production domains, or credentialed URLs.
- Routes must be normalized with a leading slash and trailing slash except root.
- Approved and forbidden routes must not overlap.
- Every approved route must have one page answer.
- Every page media reference must exist in `media`.
- Every page form reference must match `form.formId`.
- Secrets, tokens, private keys, app passwords, connection strings, and Search Console tokens are forbidden.

## Non-Secret Example

`answers.example.json` in this package is documentation/sample input only. It must not be treated as a real tenant package or imported anywhere.
