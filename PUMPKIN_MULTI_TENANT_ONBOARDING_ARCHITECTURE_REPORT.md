# Pumpkin Multi-Tenant Onboarding Architecture Report

Generated: 2026-06-07

## Result

Created a production-grade architecture/design package for a reusable multi-tenant domain onboarding system for Pumpkin CMS.

Package path:

```text
deployment/architecture/multi-tenant-onboarding-system/
```

This is Phase 1 architecture/design only. No wizard, CLI, validator implementation, tenant creation, external mutation, deployment, Search Console/indexing action, email, or Roller work occurred.

## Why It Was Created

IceSkatingRinkRentals.com proved the full production path for one tenant. The next safe step is to turn that launch learning into a repeatable package for future tenants, so future work can be gated, validated, understandable for low-skill users, and safe around secrets and external systems.

## What Was Created

| Area | Path |
| --- | --- |
| top-level architecture package | `deployment/architecture/multi-tenant-onboarding-system/` |
| non-technical user walkthrough | `deployment/architecture/multi-tenant-onboarding-system/user-walkthrough/` |
| new tenant intake package | `deployment/architecture/multi-tenant-onboarding-system/intake-package/` |
| import-ready JSON package spec | `deployment/architecture/multi-tenant-onboarding-system/import-package-spec/` |
| JSON schema drafts | `deployment/architecture/multi-tenant-onboarding-system/import-package-spec/schemas/` |
| generic import templates | `deployment/architecture/multi-tenant-onboarding-system/import-package-spec/templates/` |
| validator architecture design | `deployment/architecture/multi-tenant-onboarding-system/validator-design/` |
| plugin/extension architecture | `deployment/architecture/multi-tenant-onboarding-system/plugin-extension-design/` |
| deployment profile registry | `deployment/architecture/multi-tenant-onboarding-system/deployment-profile-registry/` |
| future Admin UI wizard design | `deployment/architecture/multi-tenant-onboarding-system/wizard-design/` |
| future CLI design | `deployment/architecture/multi-tenant-onboarding-system/cli-design/` |
| operator runbooks | `deployment/architecture/multi-tenant-onboarding-system/operator-runbooks/` |
| phased roadmap | `deployment/architecture/multi-tenant-onboarding-system/roadmap/` |

## How This Productizes the Ice Launch

The package turns Ice launch work into reusable gates:

- intake and owner decisions
- route allowlist and forbidden route model
- CMS-backed import/export expectations
- strict static output validation
- media production URL readiness
- form endpoint readiness and no-email rollback
- staging and production smoke tests
- manual owner review
- Search Console/indexing final hard stop
- explicit approvals for every external mutation

The Ice-proven deployment profile is documented as `static-azure-cloudflare-worker-graph`.

## Low-Skill User Support

The walkthrough explains tenant, domain, DNS, pages, media/images, form routing, staging, production cutover, and why indexing is last in plain language.

The intake package gives fill-in templates for business/domain, content, media, form/email, legal/privacy, analytics, owner contacts, support tickets, and troubleshooting packets. It repeatedly marks passwords, API keys, tokens, connection strings, and deployment credentials as forbidden in docs/chat/git.

## Import JSON Expectations

The import spec defines the intended folder structure:

```text
new-tenant-import-package/
  README.md
  manifest.json
  tenant.json
  site.json
  routes.json
  pages/
    home.json
    contact.json
    service-areas.json
  media-assets.json
  forms.json
  seo.json
  theme.json
  redirects.json
  schemas/
  examples/
  VALIDATION_REPORT.md
  TROUBLESHOOTING.md
```

It defines required fields, optional fields, forbidden values, validation expectations, import order, rollback behavior, schema migration, and generic examples using `example.com`, `media.example.com`, `contact@example.com`, and `TENANT_API_KEY_RUNTIME_ONLY`.

## Extension and Plugin Safety

The extension design supports future reviewed extension packs with:

- manifest schema
- version compatibility
- tenant scope
- permissions
- routes/CMS fields/API endpoints/frontend components added
- migrations
- required runtime env vars by name only
- tests
- rollback
- security review

It explicitly rejects arbitrary code drop-ins and says public marketplace support is future work, not first version.

## Deployment Profiles and Alternate Flows

The deployment profile registry allows multiple production flows while preserving common safety gates. Profiles include the Ice-proven static Azure/Cloudflare Worker/Graph path plus alternate Azure, Cloudflare Pages, dynamic site, CDN, and no-email lead capture flows.

Every profile must define required infrastructure, runtime env var names, validators, deployment steps, smoke tests, approval gates, rollback steps, unsupported actions, and Search Console/indexing final gate behavior.

## Start-State Classification

Start state included pre-existing dirty files before this package:

| Classification | Status |
| --- | --- |
| expected onboarding architecture docs | none before this run; created in this run |
| unrelated static-azure backlog | pre-existing modified `deployment/static-azure/*`, left untouched |
| unrelated app source changes | pre-existing modified `apps/ice-rink-web/*`, left untouched |
| pre-existing form preflight docs | modified `deployment/azure/ice-static-form-real-email-delivery-preflight/*`, left untouched |
| raw content-review input folders | untracked `content-review/ice-final-contact-input/` and `content-review/ice-service-areas-input/`, left untouched |
| generated artifacts | none created or staged by this run |
| protected config risk | no protected config read or printed by this run |
| unexpected files | none from this architecture package |

Recent history confirmed:

- `360bb22 Create Ice manual owner review package`
- `a4c942e Preflight Ice post-launch operational readiness`
- `3bce61c Clean Ice production indexing blockers`
- `d520e81 Complete Ice production custom domain cutover`
- `b33746e Deploy Ice static site to Azure staging`
- `746bc0b Verify Ice official fresh CMS static export`
- `64c0815 Enable Ice static form production readiness`

## Safe Evidence Reviewed

Reviewed safe Ice launch reports and packages only:

- `PUMPKIN_ICE_PRODUCTION_CUTOVER_RESULT_REPORT.md`
- `PUMPKIN_ICE_PRODUCTION_INDEXING_CLEANUP_RESULT_REPORT.md`
- `PUMPKIN_ICE_POST_LAUNCH_OPERATIONAL_READINESS_PREFLIGHT_REPORT.md`
- `PUMPKIN_ICE_MANUAL_OWNER_REVIEW_BEFORE_INDEXING_REPORT.md`
- `PUMPKIN_ICE_OFFICIAL_FRESH_CMS_EXPORT_VERIFICATION_RESULT_REPORT.md`
- `PUMPKIN_ICE_STATIC_FORM_PRODUCTION_ENABLEMENT_RESULT_REPORT.md`
- `PUMPKIN_ICE_CLOUDFLARE_WORKER_MEDIA_DELIVERY_RESULT_REPORT.md`
- `PUMPKIN_ICE_STATIC_DRY_RUN_READINESS_REPORT.md`
- selected safe files under the named Ice deployment packages

No protected config was read.

## Readiness Classification

| Area | Status |
| --- | --- |
| multi-tenant onboarding architecture package created | yes |
| import-ready page JSON package spec created | yes |
| schema/template drafts created | yes |
| plugin/extension design created | yes |
| deployment profile registry design created | yes |
| user walkthrough created | yes |
| implementation performed | no |
| new tenant created | no |
| external systems changed | no |
| Search Console/indexing affected | no |
| Roller | paused |

## Hard Safety Boundaries

This run did not create Azure resources, create Cosmos resources, create Blob containers, change Cloudflare DNS, deploy, update CMS records, update MediaAsset records, change Function App settings, send email, touch Microsoft 365 settings, submit anything to Search Console, request indexing, read protected config, touch Roller, print secrets, stage generated static artifacts, or stage raw content-review inputs.

## Search Console and Indexing Hard Stop

Search Console submission, sitemap submission, URL Inspection, indexing requests, and final indexing enablement remain final completion tasks only.

Future indexing work must wait until production smoke, owner review, content/legal/form/analytics/monitoring/rollback gates, and explicit final indexing approval are complete.

## Final Validation

| Check | Result |
| --- | --- |
| required file presence | pass, 174 required package files present |
| manifest JSON parse | pass |
| all new `.json` and `.schema.json` parse | pass, 25 files |
| node `--check` for changed JS/MJS | not applicable; new package changed no JS/MJS files |
| `git diff --check` | pass; only pre-existing CRLF warnings from unrelated dirty tracked files were emitted |
| trailing whitespace scan on new docs/source | pass |
| protected/generated/raw artifact path check | pass |
| targeted secret scan | pass |
| CMS writes | not performed |
| MediaAsset writes | not performed |
| Azure changes | not performed |
| Cloudflare changes | not performed |
| DNS changes | not performed |
| deployment | not performed |
| Function setting changes | not performed |
| email/Microsoft 365 work | not performed |
| Search Console/indexing actions | not performed |
| Roller work | not performed |

