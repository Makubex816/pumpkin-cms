# V2.8.53R External SDI-AI Pumpkin CMS Repo Audit Report

## Phase Status

Status: `completed_read_only_external_repo_audit_compatibility_map_created`

Lane: V2.8 Tenant Website / Pumpkin Live Platform Readiness

Classification: `external_sdi_ai_pumpkin_cms_repo_audit_compatibility_map_no_mutation`

Secondary tenant creation remains hard-paused.

## External Repo Commit Lock

External reference:

`https://github.com/SDI-AI/pumpkin-cms`

Local read-only reference clone:

`C:\Users\User\Desktop\PumpkinCMS\external-reference\SDI-AI-pumpkin-cms`

Commit lock:

| Field | Value |
| --- | --- |
| Remote URL | `https://github.com/SDI-AI/pumpkin-cms` |
| Branch | `main` |
| Commit SHA | `947cf05a1b6fbf1721bc3c112e1052f0c6c59b8a` |
| Commit date | `2026-05-27T14:48:34-04:00` |
| File count | 188 |
| External clone status | Clean |

## Architecture Summary

The external repo is the same Pumpkin CMS core lineage, not an unrelated system. It contains:

- `apps/pumpkin-api`: .NET API targeting `net10.0`.
- `apps/pumpkin-net-models`: shared .NET models.
- `packages/pumpkin-ts-models`: TypeScript model package.
- `packages/pumpkin-block-views`: reusable block rendering package.
- `apps/admin`: Next.js admin UI.
- `apps/sample-app`: Next.js sample public site.

The external README still says .NET 9.0 in prose, but `global.json` and the API project target .NET 10.

## Parity Summary

The current local build preserves most external core assumptions and adds live-readiness capability:

- Health routes.
- Auth verify/logout.
- Page export/import/delete/rollback.
- FormDefinition expansion.
- MediaAsset lifecycle.
- PublishRun and ImportRun registries.
- Static contact managed API bridge and health.
- Tenant onboarding package contract.
- Backup package proof.

Important compatibility gaps:

- Current route table is missing the external `POST /api/forms/{tenantId}/submit/{type}` route.
- Current route table is missing external admin FormEntry aliases under `/api/admin/forms/{tenantId}/entries`.
- Current hard-coded publish/static/provider maps include Ice and Roller assumptions but not the paused secondary candidate `strip-club-near-me-vegas`.
- Current ProviderMetadataService reports lower-case plural future-target container names while source data access uses singular Pascal container names.

## Required Strategy

Do not replace or mutate the external repo, its database assumptions, or systems that depend on it. Treat the external repo as an immutable compatibility contract.

Before secondary tenant creation resumes, current Pumpkin must have an approved compatibility layer that:

- Preserves external public routes and adds aliases for missing external routes.
- Keeps singular source container assumptions compatible.
- Makes Ice/Roller hard-coded tenant/site/publish/static-contact assumptions data-driven or explicitly extends them for each approved tenant.
- Documents any unavoidable divergence as adapter behavior, not a breaking change.

## Runtime No-Regression

GET-only no-regression checks passed across 14 routes:

- Ice apex and www `/`, `/contact`, `/service-areas`, and `/api/static-contact-health`.
- Isolated Static Web App `/api/static-contact-health`.
- Pumpkin API `/health` and `/api/health`.
- Admin UI production `/`, `/login`, and `/dashboard`.

Pumpkin API health still returns HTTP 200 while reporting `providerConfigured:false`; this remains a recorded health-signal follow-up.

## Security Boundary

No external repo mutation, external push, branch creation, live mutation, tenant creation, deploy, appsetting change, Azure mutation, DNS/indexing action, contact POST, form submission, media upload, key/listKeys, SAS generation, protected config read, or secret printing occurred.

No files were staged.

## Outputs

Result package:

`deployment/architecture/tenant-website-publish-readiness/v2-8-53r-external-sdi-ai-repo-audit-result/`

Durable docs:

- `deployment/architecture/pumpkin-platform/PUMPKIN_EXTERNAL_SDI_AI_REPO_AUDIT_V2_8_53R.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_EXTERNAL_COMPATIBILITY_MATRIX_V2_8_53R.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_EXTERNAL_HARDCODED_REQUIREMENTS_V2_8_53R.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_EXTERNAL_INTEGRATION_BUILD_MAP_V2_8_53R.md`

Next approval is folded into:

`deployment/architecture/tenant-website-publish-readiness/v2-8-53r-external-sdi-ai-repo-audit-result/next-phase-prompt.md`

## Commit Scope

Stage only these exact paths:

- `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_53R_EXTERNAL_SDI_AI_REPO_AUDIT_REPORT.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-53r-external-sdi-ai-repo-audit-result/`
- `deployment/architecture/pumpkin-platform/PUMPKIN_EXTERNAL_SDI_AI_REPO_AUDIT_V2_8_53R.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_EXTERNAL_COMPATIBILITY_MATRIX_V2_8_53R.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_EXTERNAL_HARDCODED_REQUIREMENTS_V2_8_53R.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_EXTERNAL_INTEGRATION_BUILD_MAP_V2_8_53R.md`
