# Pumpkin Ice Next Gate Production Media And Form Planning Report

Generated: 2026-06-04

## Scope

This report records the planning-only package creation for the next IceSkatingRinkRentals.com gates:

1. production media setup planning
2. static form endpoint setup planning

No resources, writes, uploads, DNS changes, deployment, email, Microsoft 365 work, protected config access, or Roller work occurred.

## Start State

Branch:

```text
feature/admin-page-editor-import-export
```

Latest relevant commits were present:

```text
f5c8d5f Add Ice local phase closure handoff
d203c65 Close Ice static dry-run local phase
a67460e Document Ice remaining strict validator blockers
4111bdd Document Ice CMS metadata repair results
cff1c1a Plan Ice static quality gate CMS repairs
7f9c0eb Document Ice static quality gate blockers
```

Start-state working tree classification:

| Classification | Paths |
| --- | --- |
| unrelated static-azure backlog | `deployment/static-azure/cloudflare-cutover-checklist.md`, `deployment/static-azure/cms-to-static-publish-bridge.md`, `deployment/static-azure/ice-staging-swa-runbook.md`, `deployment/static-azure/scripts/static-publish-dry-run.mjs`, `deployment/static-azure/staging-first-plan.md`, `deployment/static-azure/staging-validation-checklist.md`, `deployment/static-azure/static-release-checklist.md`, `deployment/static-azure/swa-staging-execution-prep.md`, `deployment/static-azure/validate-staging-package.mjs`, `deployment/static-azure/validate-static-output.mjs` |
| raw content-review input folders | `content-review/ice-final-contact-input/`, `content-review/ice-service-areas-input/` |
| generated artifacts | none shown in status |
| protected config risk | none shown in status |
| unexpected files | none at start |

No files were staged.

## Local Phase Closed Summary

The Ice local static dry-run phase is closed.

Confirmed from docs:

- Ice local static export completes successfully.
- `npm run validate:snapshot:ice` passes.
- snapshot slugs are exactly `contact`, `home`, `service-areas`
- approved routes are exactly `/`, `/contact`, `/service-areas`
- copied artifact routes are exactly `/`, `/contact`, `/service-areas`
- preview/obsolete deployable paths: 0
- noindex blockers are cleared
- social metadata local `/media/...` image blocker is cleared
- remaining strict validator failures are expected production blockers only
- `LOCAL_PHASE_CLOSURE.md` exists
- `ICE_LOCAL_PHASE_CLOSED_NEXT_GATE_HANDOFF.md` exists
- Roller remains paused

## Why The Next Gates Are Media And Form

Strict production/staging validators still fail because:

| Blocker | Count | Why it remains |
| --- | ---: | --- |
| local body/media URLs | 6 file-level errors | visible approved page imagery still uses local `/media/ice-rink-rentals/...` URLs tied to Ice MediaAsset IDs |
| static form endpoint not configured | 1 | no public static endpoint URL is configured |
| static form endpoint/backend verification missing | 1 | `STATIC_FORM_ENDPOINT_VERIFIED` is not `true` |

No local repair is appropriate:

- clearing body/media fields would remove visible approved imagery
- placeholder/local form endpoints must not be used to claim production readiness

## Planning Packages Created

Production media setup planning:

```text
deployment/azure/ice-production-media-setup-planning/
```

Files:

- `README.md`
- `MEDIA_ASSET_INVENTORY.md`
- `MEDIA_URL_TARGETS.md`
- `AZURE_BLOB_PLANNING.md`
- `CLOUDFLARE_MEDIA_DOMAIN_PLANNING.md`
- `MEDIA_VALIDATION_PLAN.md`
- `APPROVAL_CHECKLIST.md`
- `REMAINING_RISKS.md`
- `manifest.json`

Static form endpoint setup planning:

```text
deployment/azure/ice-static-form-endpoint-setup-planning/
```

Files:

- `README.md`
- `FORM_ENDPOINT_REQUIREMENTS.md`
- `VALIDATION_AND_SANITIZATION_REQUIREMENTS.md`
- `ENVIRONMENT_VARIABLES_REQUIRED.md`
- `LOCAL_TEST_PLAN.md`
- `AZURE_FUNCTION_OR_ENDPOINT_PLANNING.md`
- `EMAIL_DELIVERY_PLANNING.md`
- `APPROVAL_CHECKLIST.md`
- `REMAINING_RISKS.md`
- `manifest.json`

## Media Planning Result

Target media domain:

```text
media.iceskatingrinkrentals.com
```

Target public URL pattern:

```text
https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

Media planning records documented Ice MediaAsset IDs from existing safe audits and keeps these actions gated behind future explicit approval:

- Azure Storage creation
- Blob container creation
- media upload
- Cloudflare DNS/cache changes
- MediaAsset record updates
- CMS record updates
- media production URL readiness `yes`

Media production URL readiness remains `no`.

## Static Form Planning Result

Endpoint remains missing and unverified.

Preferred frontend env var:

```text
NEXT_PUBLIC_STATIC_FORM_ENDPOINT
```

Verification flag:

```text
STATIC_FORM_ENDPOINT_VERIFIED=true
```

The package keeps these actions gated behind future explicit approval:

- endpoint deployment
- Azure Function or equivalent resource creation
- production env var setting
- `STATIC_FORM_ENDPOINT_VERIFIED=true`
- sending test email
- touching Microsoft 365
- contact form production readiness `yes`

Contact form production readiness remains `no`.

## Readiness Classification

| Gate | Status |
| --- | --- |
| static dry run completed | yes |
| static route output ready | yes |
| static output quality gates | no |
| media production URL readiness | no |
| contact form production readiness | no |
| Azure staging readiness | no |
| DNS cutover readiness | no |
| production/indexing readiness | not live-ready |
| Roller | paused |

## Actions Not Performed

- no Azure resources created
- no Cosmos resources created
- no Blob containers created
- no Cloudflare DNS or cache changes
- no deployment
- no CMS records updated
- no MediaAsset records updated
- no media uploaded
- no email sent
- no Microsoft 365 settings touched
- no protected config read or modified
- no secrets, API keys, JWTs, tokens, connection strings, or provider credentials printed
- no generated static artifacts staged
- no Roller work

## Next Appropriate Approval Gates

The next work should remain split into separate explicit approval gates:

1. Production media setup planning review and execution approval.
2. Static form endpoint setup planning review and execution approval.

Only after those are completed should Azure staging, DNS/cutover, Microsoft 365/email, or deployment work continue.
