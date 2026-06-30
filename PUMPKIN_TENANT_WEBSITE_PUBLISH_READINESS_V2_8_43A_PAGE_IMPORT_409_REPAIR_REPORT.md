# V2.8.43A Page Import 409 Repair Report

Status: succeeded.

Lane: V2.8 Tenant Website / Pumpkin Live Platform Readiness.

Classification: `page_import_409_repaired_importrun_closeout`.

Tenant: `ice-rink-rentals`.

## Carryforward

V2.8.43 closed the MediaAsset retry lane successfully, including one synthetic blob upload, public `curl.exe` proof HTTP 200, full Admin MediaAsset lifecycle proof, blob cleanup, and final proof prefix count 0. It then blocked only on the page import proof after source page create HTTP 201, export HTTP 200, package validation pass, and one import HTTP 409. No import retry was attempted and the synthetic source page was cleaned up.

## Diagnosis

The V2.8.43 import reused the exported page slug and document identity. Source review showed the import route normalized slugs through `PageRedirectGuard`, while the source create route allowed underscores in the synthetic slug. That made the route miss the just-created source slug and attempt a create with the exported page ID, producing the 409. Source review also found the page import route built an `ImportRun` without preparing a stable Cosmos `id`, which would have risked the audit write after the page create path was repaired.

## Repair

The API repair stayed page-only and tenant-scoped:

- Added `targetSlug` support on `PageImportRequest`.
- Preserved exported source identity as provenance before target mutation.
- Generated a fresh `page-import-{guid}` document ID for imported page creates.
- Sent the page-only `ImportRun` through `ImportRunSanitizer.PrepareForSave(...)` before saving.
- Added focused source assertions for the repaired behavior.

No theme, form, media binary, contact, appsetting, DNS, indexing, storage key, SAS, or direct Cosmos work was performed.

## Live Proof

Pumpkin API was published with protected config excluded and deployed exactly once. Deployment `f333055c-3bb0-4419-8fa9-40fd5a632608` returned `RuntimeSuccessful`.

Post-deploy health:

- `/health`: HTTP 200, `providerConfigured:false`.
- `/api/health`: HTTP 200, `providerConfigured:false`.
- Admin login: HTTP 200, token present. The token was not printed or written.

Corrected proof trace: `v2-8-43a-page-20260629235514-2bc2a7f1`.

- Previous V2.8.43 residual slug readback: HTTP 404.
- Source slug preflight: HTTP 404.
- Imported target slug preflight: HTTP 404.
- Source page create: HTTP 201.
- Export: HTTP 200.
- Export package validation: single page, tenant match true, secret hit count 0.
- Corrected import: HTTP 200, action `created`.
- Imported page readback: HTTP 200, slug matched, import run matched.
- ImportRun readback: HTTP 200, status `completed`, page count 1, create count 1.
- Cleanup: source delete HTTP 200, imported delete HTTP 200.
- Final residual readback: source HTTP 404, imported HTTP 404.

Admin UI import/export readiness carries forward from V2.8.43 as `admin_ui_media_import_export_ready_readonly` for both isolated and production hosts.

## Validation

Focused source test, MediaAsset no-regression source test, API build, publish artifact checks, POSIX ZIP checks, one live deploy, live health/login, corrected export/import proof, cleanup readback, JSON/script checks, diff checks, protected-path checks, and secret scans were run. No files were staged.

Result package: `deployment/architecture/tenant-website-publish-readiness/v2-8-43a-page-import-409-repair-result/`.
