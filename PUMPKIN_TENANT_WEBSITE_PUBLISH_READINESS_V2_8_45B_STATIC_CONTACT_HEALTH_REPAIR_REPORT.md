# V2.8.45B Static Contact Health Repair Report

Phase status: blocked with exact next handoff required.

Lane: V2.8 Tenant Website / Pumpkin Live Platform Readiness.

Classification: `swa_managed_api_backend_unavailable_redeploy_requires_missing_swa_deployment_token`.

## V2.8.45 Carryforward

V2.8.45 completed the approved monitoring, diagnostics, alerting, and media storage protection hardening, but blocked because public `/api/static-contact-health` returned HTTP 500 on apex and www.

The V2.8.45B scope stayed GET-only for runtime proof. No contact POST, content write, DNS/indexing action, Pumpkin API deploy, Admin UI deploy, storage rollback, Key Vault read, storage key/listKeys, SAS generation, or connection string generation occurred.

## Start State

Static contact health start state:

- `https://iceskatingrinkrentals.com/api/static-contact-health`: HTTP 500, `Backend call failure`.
- `https://www.iceskatingrinkrentals.com/api/static-contact-health`: HTTP 500, `Backend call failure`.
- `https://happy-mud-0b375e20f.7.azurestaticapps.net/api/static-contact-health`: HTTP 500, `Backend call failure`.
- `https://kind-island-0a85a740f.7.azurestaticapps.net/api/static-contact-health`: HTTP 500, `Backend call failure`.

Public pages, Pumpkin API health, and production Admin UI stayed available in final GET-only proof.

## Diagnosis

Source analysis found that `deployment/static-azure/forms/static-form-endpoint-compat/static-contact-health/index.js` is an anonymous GET health sentinel that returns HTTP 200 and does not read appsettings, secrets, Pumpkin API, Cosmos, Graph, or storage.

Local compat tests passed.

The redacted SWA appsetting comparison initially exposed parser ambiguity in the Azure CLI output shape. After correcting for the nested `properties` object and applying the approved secure-file static-contact settings to both SWAs, all seven expected setting names were present, non-empty, exact matches, and had no outer whitespace. No values were printed or written.

Log Analytics returned no matching rows for the static-contact health failure during the query window, so that evidence path was classified as logs unavailable due ingestion delay.

The isolated SWA diagnostic setting was removed only as a causal probe. Isolated `/api/static-contact-health` stayed HTTP 500 over bounded polling, so SWA diagnostics were not proven causal. The isolated diagnostic setting was restored. Production SWA diagnostics were not rolled back.

GET-only backend shape checks showed every tested `/api/*` route, including a deliberately missing API path, returned the same SWA platform `Backend call failure` on both production and isolated. This classifies the active blocker as managed SWA API backend unavailability, not contact handler logic, custom-domain forwarding, Pumpkin API health, or static page content.

## Repair Result

Completed:

- Set only the seven approved static-contact appsettings from `.tmp/v2-8-45b/secure/static-contact-health-repair.json` on production and isolated SWAs with Azure output suppressed.
- Confirmed redacted exact-match comparison after repair.
- Ran isolated-only SWA diagnostic rollback probe and restored the setting after it was non-causal.

Not attempted:

- No static-contact source edit.
- No isolated SWA redeploy.
- No production SWA redeploy.

The next plausible repair is a static-contact SWA package redeploy, isolated first, then production only after isolated health passes. That requires a SWA deployment token or approved deployment credential. No deployment token was present in the process, and the approved secure file did not contain one, so the phase stopped under the secure-value hard stop.

## Final GET-Only Runtime Proof

Final GET-only runtime proof:

- Production apex/static health: HTTP 500, `Backend call failure`.
- Production www/static health: HTTP 500, `Backend call failure`.
- Production default host/static health: HTTP 500, `Backend call failure`.
- Isolated/static health: HTTP 500, `Backend call failure`.
- Production apex `/`, `/contact`, `/service-areas`: HTTP 200.
- Production www `/`, `/contact`, `/service-areas`: HTTP 200.
- Pumpkin API `/health` and `/api/health`: HTTP 200.
- Production Admin UI `/` and `/login`: HTTP 200.

No contact POST was sent.

## Hardening Preservation

Preserved:

- Production and isolated SWA diagnostic setting `diag-to-law-pumpkin-prod-001` present with `StaticSiteHttpLogs`, `StaticSiteDiagnosticLogs`, and `AllMetrics`.
- Media storage blob soft delete enabled for 30 days.
- Media storage container soft delete enabled for 30 days.
- Media storage blob versioning enabled.
- Media storage change feed enabled.
- Log Analytics workspace and action group present.
- Six expected metric alerts present and enabled.

## Security Boundary

The approved secure file was read only from `.tmp/v2-8-45b/secure/static-contact-health-repair.json`.

No secret value, API key, bearer token, cookie, connection string, SAS, storage key, or protected config value was printed or written to repo files.

The secure file is retained because this phase is blocked and retry needs approved secure material. It must not be staged.

## Files

Created:

- `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_45B_STATIC_CONTACT_HEALTH_REPAIR_REPORT.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-45b-static-contact-health-repair-result/`

Modified source files: none.

Next approval is folded into `deployment/architecture/tenant-website-publish-readiness/v2-8-45b-static-contact-health-repair-result/next-phase-prompt.md`.

