# PUMPKIN Tenant Website Publish Readiness V2.8.30 Contact Delivery Remediation Mode Selection Report

Date: 2026-06-27

## Phase Status

Status: completed.

Lane: V2.8 Tenant Website / Post-Release Contact Verification.

Classification: `contact_delivery_remediation_mode_selection_no_deploy_no_post`.

Result package:

`deployment/architecture/tenant-website-publish-readiness/v2-8-30-contact-delivery-remediation-mode-selection-result/`

## Executive Finding

V2.8.30 selects `admin-persistence-required` as the remediation mode.

The production contact delivery gate is not closed by email notification or by a local accepted entry ID. It closes only when accepted IceSkatingRinkRentals.com contact submissions create Pumpkin `FormEntry` records in the same backend/store read by the Admin Lead Inbox.

The preferred next implementation is to keep the public static endpoint contract (`/api/static-contact`) and bind its existing `pumpkin-api` delivery mode to the Pumpkin API `POST /api/forms/{tenantId}/entries` write path. That endpoint already exists and requires the tenant API key through the `Authorization: Bearer` header. The static compat function must use a protected Ice tenant API key setting and the same Pumpkin API backend that Admin reads.

## V2.8.26 Carryforward

- Production-bound target: `swa-ice-static-staging`.
- Production `/contact`: 200 and wired to `/api/static-contact`.
- Production `/api/static-contact-health`: 200, `ok:true`, `programmingModel: azure-functions-v3-function-json`.
- Exactly one production POST was sent.
- Production POST: `200`, `ok:true`.
- Trace ID: `v2-8-26-production-contact-20260626101926`.
- Entry ID: `ice-rink-rentals-default-quote-request-f9e8a6d2-3f9c-41d2-92e0-39f8ea83dbd5`.

## V2.8.27 Carryforward

V2.8.27 reviewed V2.8.26 repo-local evidence only. Operator delivery confirmation values were missing, so backend delivery could not be confirmed. No deploy, POST, protected config read, or inbox/provider access occurred.

## V2.8.28 Carryforward

V2.8.28 received public-safe operator values matching the V2.8.26 trace and entry IDs. The operator confirmed the Admin lead/contact submissions view did not show the exact submission, so backend delivery remained unconfirmed.

## V2.8.29 Carryforward

V2.8.29 classified the root cause as API acceptance without persistence. The compat handler generates the ID before delivery and persists to Admin-visible Pumpkin `FormEntry` storage only when mode resolves to `pumpkin-api`. Admin reads Pumpkin API `/api/admin/{tenantId}/form-entries`, backed by tenant-scoped `FormEntry` storage.

## Operator Remediation Input

The approved public-safe remediation env values were present and aligned:

- Mode: `admin-persistence-required`.
- Admin persistence required: `true`.
- Email notification required: `false`.
- Dual delivery target: `future-optional-after-admin-persistence`.
- Tenant ID: `ice-rink-rentals`.
- Form ID: `default-quote-request`.
- Public email: `contact@iceskatingrinkrentals.com`.
- Last trace ID and entry ID match V2.8.26.
- Approved mode: `no-deploy-no-post-public-safe-binding-preflight`.

## Delivery Mode Decision

Selected mode: `admin-persistence-required`.

Email-only is rejected for this gate because Admin visibility is required. Dual delivery remains a future option after Admin persistence is proven. Moving the contact API into Pumpkin API is possible later, but the lowest-risk next step is to bind the existing compat function to Pumpkin API persistence.

## Write Path Analysis

Existing write endpoint:

- `apps/pumpkin-api/Program.cs:251` maps `POST /api/forms/{tenantId}/entries`.
- `apps/pumpkin-api/Program.cs:255-264` extracts a Bearer API key and calls `PumpkinManager.SaveFormEntryAsync`.
- `apps/pumpkin-api/Managers/PumpkinManager.cs:178-207` requires API key, tenant ID, form data, guard validation, and creates the `FormEntry`.

Compat static endpoint:

- `deployment/static-azure/forms/static-form-endpoint-compat/contact-handler.mjs:91-118` builds the entry before delivery and returns the saved ID.
- `deployment/static-azure/forms/static-form-endpoint-compat/contact-handler.mjs:173-185` only forwards to Pumpkin API in `pumpkin-api` mode.
- `deployment/static-azure/forms/static-form-endpoint-compat/contact-handler.mjs:205-227` posts to `/api/forms/{tenantId}/entries` with the site API key.

## Admin Read Path Confirmation

Admin Lead Inbox reads only Pumpkin `FormEntry` records:

- `apps/admin/src/app/dashboard/forms/page.tsx:45-50` loads entries through `apiClient.getFormEntries`.
- `apps/admin/src/lib/api.ts:402-413` calls `/api/admin/{tenantId}/form-entries`.
- `apps/pumpkin-api/Program.cs:1195-1224` returns `databaseService.GetFormEntriesByTenantAsync(tenantId)`.

## Tenant/Site/Form Binding Worksheet

Known public-safe binding facts:

- Site key: `ice-rink-rentals`.
- Tenant ID: `ice-rink-rentals`.
- Public domain: `iceskatingrinkrentals.com`.
- Public contact route: `/contact`.
- Static contact endpoint: `/api/static-contact`.
- Form ID/Form key: `default-quote-request`.
- Expected entry ID pattern: `ice-rink-rentals-default-quote-request-{uuid}`.
- Public email display/mailto only: `contact@iceskatingrinkrentals.com`.
- Static endpoint ref: `ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT`.
- Lead recipient ref: `ICE_RINK_RENTALS_LEAD_RECIPIENT`.

Protected values required later, by name and purpose only:

- `FORM_DELIVERY_MODE`: set to `pumpkin-api` for the static compat function.
- `PUMPKIN_API_URL`: Pumpkin API base URL for the same backend/provider Admin reads.
- `ICE_RINK_RENTALS_API_KEY`: protected tenant API key used by the compat function to call Pumpkin API.
- `STATIC_FORM_ALLOWED_SITE_KEYS`: allow the Ice site key if not already bound.
- `STATIC_FORM_ALLOWED_ORIGINS`: allow approved Ice production/custom-domain origins.
- Optional email settings remain future-gated for dual delivery and are not required to close Admin persistence.

## Implementation Design

V2.8.31 should implement Admin persistence first:

1. Add or verify a local mocked-fetch test proving `FORM_DELIVERY_MODE=pumpkin-api` forwards to `/api/forms/ice-rink-rentals/entries` and returns the saved ID without calling a real network endpoint.
2. Confirm the static compat package includes the existing `pumpkin-api` forwarding code and validation mappings.
3. In an explicitly approved deployment/binding phase, bind the static function settings to `FORM_DELIVERY_MODE=pumpkin-api`, `PUMPKIN_API_URL`, and `ICE_RINK_RENTALS_API_KEY`.
4. Validate in isolated staging with synthetic no-PII POST only after that phase is approved.
5. Promote to production and send a single live POST only behind a separate production retry gate.

## Validation And Gates

Isolated staging validation plan:

- Deploy only to an isolated staging target with no custom domains.
- Use a no-PII synthetic POST after approval.
- Confirm HTTP `200`, `ok:true`, returned entry ID pattern, and Admin-visible `FormEntry` in the same target backend.
- Do not use email delivery as the Admin persistence proof.

Future production release and POST gate:

- Require separate approval for production deployment.
- Require separate approval for any production contact POST retry.
- Permit exactly one production no-PII POST after production binding is deployed.
- Close the contact gate only after operator/Admin readback confirms the exact trace/entry is visible in Admin.

## Contact Gate Status

Gate status: open only for backend delivery visibility/routing remediation.

Admin persistence remains unproven until the static contact endpoint creates a Pumpkin `FormEntry` record in the Admin-readable backend.

## Security Boundary

No deployment, redeployment, SWA deploy, contact form POST, production API call, DNS/custom-domain mutation, Azure mutation, Azure app settings list/show, protected config read, `.env.local` read, appsettings read, local.settings read, Key Vault query, keys/listKeys, connection string generation, SAS generation, inbox/provider login, Search Console/indexing action, sitemap submission, URL Inspection API call, Google Indexing API call, production crawling, or arbitrary outbound URL check occurred.

Only approved public-safe `PUMPKIN_CONTACT_DELIVERY_*` environment values were read.

## Validation

Validation results are recorded in:

`deployment/architecture/tenant-website-publish-readiness/v2-8-30-contact-delivery-remediation-mode-selection-result/validation-summary.md`

## Files Created

- `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_30_CONTACT_DELIVERY_REMEDIATION_MODE_SELECTION_REPORT.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-30-contact-delivery-remediation-mode-selection-result/`

## Exact Next Approval

The exact next approval is folded into:

`deployment/architecture/tenant-website-publish-readiness/v2-8-30-contact-delivery-remediation-mode-selection-result/next-phase-prompt.md`

## Exact-Path Commit Instructions

```powershell
git add -- "PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_30_CONTACT_DELIVERY_REMEDIATION_MODE_SELECTION_REPORT.md" "deployment/architecture/tenant-website-publish-readiness/v2-8-30-contact-delivery-remediation-mode-selection-result"
git commit -m "Record V2.8.30 contact delivery remediation mode"
```
