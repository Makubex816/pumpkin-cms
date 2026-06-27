# PUMPKIN Tenant Website Publish Readiness V2.8.29 Contact Backend Delivery Non-Delivery Triage Report

Status: completed.

Lane: V2.8 Tenant Website / Post-Release Contact Verification.

Classification: `contact_backend_delivery_non_delivery_triage_no_deploy_no_post`.

Result package:

`deployment/architecture/tenant-website-publish-readiness/v2-8-29-contact-backend-delivery-non-delivery-triage-result/`

## Executive Finding

The production contact API accepted response did not prove Admin-visible persistence.

The static compat handler validates the payload, builds an entry object, and generates an entry ID before delivery. It writes that entry to Pumpkin API only when delivery mode resolves to `pumpkin-api`. In `dry-run` or `no-email`, it returns `200 ok:true` with the generated ID and no persistence. In `graph`, it sends email through Microsoft Graph and returns success after Graph `202`, but it still does not create a Pumpkin `FormEntry`.

Admin's tenant quote/contact submissions view reads Pumpkin API `/api/admin/{tenantId}/form-entries`, which reads tenant-scoped `FormEntry` storage. Therefore the V2.8.26 entry will not appear in Admin unless `/api/static-contact` forwarded to the same Pumpkin API backend/provider that Admin reads.

## V2.8.26 Carryforward

- Production-bound target: `swa-ice-static-staging`.
- Production `/contact`: 200 and wired to `/api/static-contact`.
- Production `/api/static-contact-health`: 200, `ok:true`, Azure Functions v3 `function.json` programming model.
- Exactly one production POST was sent.
- Production POST: `200`, `ok:true`.
- Trace ID: `v2-8-26-production-contact-20260626101926`.
- Entry ID: `ice-rink-rentals-default-quote-request-f9e8a6d2-3f9c-41d2-92e0-39f8ea83dbd5`.

## V2.8.27 Carryforward

V2.8.27 reviewed the V2.8.26 evidence from repo-local sources only. Operator confirmation env values were missing, so backend delivery could not be confirmed. No deploy, POST, protected config read, or inbox/provider access occurred.

## V2.8.28 Carryforward

Operator-provided trace and entry IDs matched V2.8.26, but Admin visibility was false. The operator note said the Admin tenant quote/contact submissions view did not show the exact trace or entry, and the latest visible entry was older than the production test.

## Operator Triage Input

- `PUMPKIN_CONTACT_TRIAGE_TRACE_ID`: `v2-8-26-production-contact-20260626101926`
- `PUMPKIN_CONTACT_TRIAGE_ENTRY_ID`: `ice-rink-rentals-default-quote-request-f9e8a6d2-3f9c-41d2-92e0-39f8ea83dbd5`
- `PUMPKIN_CONTACT_TRIAGE_API_ACCEPTED`: `true`
- `PUMPKIN_CONTACT_TRIAGE_API_STATUS`: `200`
- `PUMPKIN_CONTACT_TRIAGE_API_OK`: `true`
- `PUMPKIN_CONTACT_TRIAGE_ADMIN_INBOX_VISIBLE`: `false`
- `PUMPKIN_CONTACT_TRIAGE_APPROVED_MODE`: `no-deploy-no-post-readonly-source-triage`

## Contact API Acceptance vs Persistence

Source references:

- `deployment/static-azure/forms/static-form-endpoint-compat/contact-handler.mjs:91-119`
- `deployment/static-azure/forms/static-form-endpoint-compat/contact-handler.mjs:173-228`
- `deployment/static-azure/forms/static-form-endpoint-compat/graph-send-mail-delivery.mjs:6-37`
- `deployment/static-azure/forms/static-form-endpoint-compat/test-static-form-endpoint-compat.mjs:8-14`
- `deployment/static-azure/forms/static-form-endpoint-compat/test-static-form-endpoint-compat.mjs:118-123`

The compat function only persists through `forwardToPumpkin`. Dry-run/no-email and Graph delivery return an ID without creating an Admin-visible `FormEntry`.

## Entry ID Generation

The entry ID is generated locally in `buildFormEntry` as `${site.tenantId}-${formId}-${randomUUID()}`. The V2.8.26 ID matches the expected pattern, but the ID alone does not prove storage.

## Admin Inbox Source

Admin `/dashboard/forms` loads `apiClient.getFormEntries(token, currentTenant.tenantId)`. The API client calls `/api/admin/{tenantId}/form-entries`. Pumpkin API then calls `databaseService.GetFormEntriesByTenantAsync(tenantId)`.

Source references:

- `apps/admin/src/app/dashboard/forms/page.tsx:45-50`
- `apps/admin/src/lib/api.ts:402-413`
- `apps/pumpkin-api/Program.cs:1194-1224`

## Pumpkin API Submission Read Path

Pumpkin API writes form entries through `POST /api/forms/{tenantId}/entries`, validates via `FormSubmissionGuard`, and stores in `FormEntry` storage. Admin reads the same `FormEntry` model by tenant.

Source references:

- `apps/pumpkin-api/Program.cs:251-270`
- `apps/pumpkin-api/Managers/PumpkinManager.cs:178-207`
- `apps/pumpkin-api/Services/CosmosDataConnection.cs:422-502`
- `apps/pumpkin-api/Services/MongoDataConnection.cs:281-354`

## Tenant/Site/Form ID Alignment

No source-level tenant/site/form mismatch explains the missing Admin row. The relevant source values align on:

- tenant/site: `ice-rink-rentals`
- form key: `default-quote-request`
- static endpoint ref: `ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT`
- recipient ref: `ICE_RINK_RENTALS_LEAD_RECIPIENT`

One cleanup note remains: `apps/ice-rink-web/src/data/ice-rink-recovered-pages.ts` has a `formConfig.domainRoutingKey` value that looks like a recipient ref. Because the V2.8.26 request was accepted and the FormBlock payload sends `staticEndpointRef`, this is not the root cause of the accepted-but-not-visible result.

## Backend Delivery Topology

`/contact` static page -> `/api/static-contact` -> compat validation -> local entry ID generation -> delivery mode:

- `dry-run` or `no-email`: accepted response, no persistence.
- `graph`: Microsoft Graph email send acceptance, no Pumpkin `FormEntry`.
- `pumpkin-api`: POST to Pumpkin API, Admin-visible if same backend/provider.

Admin topology:

`Admin Lead Inbox -> Pumpkin API admin form-entries endpoint -> FormEntry store`

## Root Cause Classification

Primary:

- `api_acceptance_without_persistence`
- `api_generates_entry_id_only_no_storage`
- `notification_delivery_not_admin_inbox`

Conditional:

- `production_provider_binding_missing`
- `admin_inbox_reads_different_provider`
- `local_admin_not_connected_to_production_backend`
- `backend_delivery_requires_protected_config`

Not primary:

- `tenant_site_form_id_mismatch`

## Remediation Options

1. Admin persistence source of truth: configure `/api/static-contact` to use `pumpkin-api` mode and bind it to the same Pumpkin API backend Admin reads.
2. Email-only delivery: treat Graph delivery as the backend delivery gate and stop expecting Admin visibility for graph-only submissions.
3. Dual delivery: change source so accepted leads persist to Pumpkin API and send email, with explicit idempotency and partial-failure behavior.

Recommended next step: V2.8.30 remediation preflight to choose the delivery model and collect public-safe binding facts.

## Exact Missing Values / Operator Actions

Do not paste secrets. Operator should provide public-safe present/missing/yes/no statements for:

- Current static function delivery mode.
- Whether `PUMPKIN_API_URL` is configured for the static function if Admin persistence is required.
- Whether the Ice tenant API key is configured for the static function if Admin persistence is required.
- Whether Admin reads the same Pumpkin API backend/provider.
- Whether Graph mode is intended and, if so, whether Admin visibility is still required.

## Contact Gate Status

Open only for backend delivery visibility/routing remediation.

## Deferred Gates

Deployment, protected config inspection, Azure mutation, contact POST, production API calls, DNS/custom-domain changes, inbox/provider access, and indexing remain deferred.

## Security Boundary

No deploy, redeploy, SWA deploy, contact POST, production API call, DNS/custom-domain/indexing action, protected config value read, deployment token access, Azure mutation, or inbox/provider login occurred.

Boundary note: one early broad source grep surfaced a generic `appsettings.json` match before later searches excluded protected config filenames. The file was not opened, protected values were not listed or used, and the analysis did not rely on protected config.

## Validation

Completed:

- `git status --short`
- `git log --oneline -15`
- `git diff --cached --name-only`
- operator triage env presence/shape check
- `npm run check` in `deployment/static-azure/forms/static-form-endpoint-compat` - passed
- `npm test` in `deployment/static-azure/forms/static-form-endpoint-compat` - passed

Final post-write validations are recorded in the result package `validation-summary.md`.

Final validation highlights:

- JSON parse passed for `result-manifest.json`.
- No changed/new JS/MJS files were created by V2.8.29.
- `git diff --check` exited clean; new report files are untracked, so the direct trailing-whitespace scan covers them until staging.
- Secret-like scan found no token/connection-string-shaped values.
- Deploy/mutation scan found only expected textual "not performed" references.
- Protected-path guard found only expected boundary references.
- No files are staged.

## Files Created

- `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_29_CONTACT_BACKEND_DELIVERY_NON_DELIVERY_TRIAGE_REPORT.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-29-contact-backend-delivery-non-delivery-triage-result/`

## Exact Next Approval

The exact next approval is folded into:

`deployment/architecture/tenant-website-publish-readiness/v2-8-29-contact-backend-delivery-non-delivery-triage-result/next-phase-prompt.md`

## Exact-Path Commit Instructions

```powershell
git add -- "PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_29_CONTACT_BACKEND_DELIVERY_NON_DELIVERY_TRIAGE_REPORT.md" "deployment/architecture/tenant-website-publish-readiness/v2-8-29-contact-backend-delivery-non-delivery-triage-result"
git commit -m "Record V2.8.29 contact backend delivery triage"
```
