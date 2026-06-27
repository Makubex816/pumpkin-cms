# PUMPKIN Tenant Website Publish Readiness V2.8.31 Contact Admin Persistence Local Implementation Report

Date: 2026-06-27

## Phase Status

Status: completed locally, not deployed.

Lane: V2.8 Tenant Website / Post-Release Contact Verification.

Classification: `contact_admin_persistence_local_implementation_no_deploy_no_post`.

V2.8.31 implemented the local compat `/api/static-contact` path for Admin persistence through Pumpkin API mode, added mocked/no-write tests, and created the protected binding contract for a later isolated app-setting phase. This phase did not deploy, did not send a contact POST, did not mutate Azure, did not read protected config, and did not access inbox/provider systems.

Result package:

`deployment/architecture/tenant-website-publish-readiness/v2-8-31-contact-admin-persistence-local-implementation-result/`

## Carryforward

V2.8.26:

- Production `/contact` was wired to `/api/static-contact`.
- Production health returned 200, `ok:true`, `programmingModel: azure-functions-v3-function-json`.
- Exactly one production POST returned 200, `ok:true`.
- Trace ID: `v2-8-26-production-contact-20260626101926`.
- Entry ID: `ice-rink-rentals-default-quote-request-f9e8a6d2-3f9c-41d2-92e0-39f8ea83dbd5`.

V2.8.27:

- Backend delivery confirmation values were missing, so the gate remained open.

V2.8.28:

- Operator trace/entry matched V2.8.26, but Admin did not show the submission.

V2.8.29:

- Root cause was classified as API acceptance without Admin-visible persistence.
- Admin reads Pumpkin API tenant-scoped `FormEntry` storage.

V2.8.30:

- Selected mode: `admin-persistence-required`.
- Required implementation mode: `pumpkin-api`.
- Email-only delivery does not close the Admin persistence gate.

## Operator Input

The public-safe implementation env values were present and aligned:

- `PUMPKIN_CONTACT_ADMIN_PERSISTENCE_IMPL_MODE=local-source-implementation-no-deploy`
- `PUMPKIN_CONTACT_ADMIN_PERSISTENCE_REQUIRED=true`
- `PUMPKIN_CONTACT_DELIVERY_MODE_TARGET=pumpkin-api`
- `PUMPKIN_CONTACT_TENANT_ID=ice-rink-rentals`
- `PUMPKIN_CONTACT_FORM_ID=default-quote-request`
- `PUMPKIN_CONTACT_PUBLIC_EMAIL=contact@iceskatingrinkrentals.com`
- `PUMPKIN_CONTACT_PUMPKIN_API_WRITE_ROUTE=/api/forms/ice-rink-rentals/entries`
- `PUMPKIN_CONTACT_PROTECTED_KEY_ENV_NAME=PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY`
- `PUMPKIN_CONTACT_PROTECTED_BINDING_APPROVED=false`
- `PUMPKIN_CONTACT_DEPLOY_APPROVED=false`
- `PUMPKIN_CONTACT_POST_APPROVED=false`

The protected value named by `PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY` was not read.

## Implementation Result

Changed files:

- `deployment/static-azure/forms/static-form-endpoint-compat/contact-handler.mjs`
- `deployment/static-azure/forms/static-form-endpoint-compat/validate-static-form-payload.mjs`
- `deployment/static-azure/forms/static-form-endpoint-compat/test-static-form-endpoint-compat.mjs`

Behavior implemented:

- `pumpkin-api` mode now requires explicit `PUMPKIN_API_URL`.
- The protected key binding can be selected by name with `PUMPKIN_CONTACT_PROTECTED_KEY_ENV_NAME`.
- The selected protected key env name must be a safe env-var name.
- Optional write-route config must match `/api/forms/{tenantId}/entries`.
- Missing base URL or missing selected key value fails with 502 before fetch is called.
- Ice form submissions are constrained to `default-quote-request`.
- The public response uses the Pumpkin API returned `id` as `entryId` when present.
- Dry-run/no-email remains explicit and non-persistent.

## Payload Mapping

The mocked persistence test verified forwarding to:

`POST {PUMPKIN_API_URL}/api/forms/ice-rink-rentals/entries`

Forwarded payload includes:

- `tenantId=ice-rink-rentals`
- `siteKey=ice-rink-rentals`
- `formId=default-quote-request`
- `formKey=default-quote-request`
- `sourcePage=/contact`
- `metadata.source=static-form-endpoint`
- `metadata.staticEndpointRef=ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT`
- `metadata.leadRecipientRef=ICE_RINK_RENTALS_LEAD_RECIPIENT`

## Protected Binding Contract

Required later non-secret/public-safe app-setting names:

- `FORM_DELIVERY_MODE=pumpkin-api`
- `PUMPKIN_API_URL=<same Pumpkin API backend Admin reads>`
- `PUMPKIN_CONTACT_PUMPKIN_API_WRITE_ROUTE=/api/forms/ice-rink-rentals/entries`
- `PUMPKIN_CONTACT_PROTECTED_KEY_ENV_NAME=PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY`
- `STATIC_FORM_ALLOWED_SITE_KEYS=ice-rink-rentals`
- `STATIC_FORM_ALLOWED_ORIGINS=<approved isolated staging origin>`

Required later protected app-setting name:

- `PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY=<Ice tenant API key value, not recorded>`

V2.8.31 did not approve or perform protected binding.

## Test Result

Compat local tests passed and prove:

- Dry-run/no-email does not persist.
- Pumpkin API mode forwards a valid `FormEntry` payload with mocked fetch.
- Missing base URL fails safely.
- Missing protected key fails safely.
- Returned Pumpkin API `id` becomes accepted `entryId`.
- Tenant/form IDs align with `ice-rink-rentals` and `default-quote-request`.

Carryforward v4 static endpoint checks/tests also passed.

## Delivery Matrix

- `dry-run`, `no-email`, or missing/unknown mode: accepted local ID, no persistence.
- `graph` or `m365-graph`: email path only, no Pumpkin `FormEntry`.
- `pumpkin-api`: required Admin persistence path, gated by explicit base URL and protected key binding.

## Admin Readiness

Admin inbox persistence is locally ready for a later isolated binding/deployment validation phase. It is not proven live until the compat endpoint writes a Pumpkin `FormEntry` into the same backend Admin reads and Admin readback confirms the exact returned ID.

## Future Gates

Isolated staging validation plan:

- Separate approval for isolated app-setting binding.
- Separate approval for isolated deployment.
- Separate approval for one isolated no-PII POST.
- Admin readback must confirm the exact returned `entryId`.

Future production plan:

- Separate approval for production binding/deployment.
- Separate approval for any production POST retry.
- At most one production no-PII POST after production deployment approval.

## Gate Status

Contact gate status: open.

Reason: local implementation is complete, but no protected binding, deployment, POST, or Admin readback occurred.

## Security Boundary

Confirmed:

- No deployment.
- No contact POST.
- No Azure mutation.
- No Azure app settings list/show/set.
- No protected config read.
- No `.env.local`, appsettings, local.settings, Key Vault, keys/listKeys, connection string, or SAS access.
- No inbox/provider access.
- No production API call, health check, crawl, DNS/custom-domain action, or indexing action.

## Validation

Validation passed:

- Compat API `npm run check`.
- Compat API `npm test`.
- Changed MJS syntax checks.
- Carryforward v4 static endpoint `npm run check`.
- Carryforward v4 static endpoint `npm test`.
- JSON parse for `result-manifest.json`.
- `git diff --check` and scoped V2.8.31 diff check, with line-ending warnings only.
- Trailing whitespace scan.
- Secret-like scan.
- Deploy/mutation command-shape scan.
- Protected/generated/raw path guard.
- No staged files.

Not run:

- Ice web `npm run type-check`, because V2.8.31 did not change shared Ice web source.
- `npm run validate:static:ice`, because V2.8.31 did not affect web/static output.

Detailed validation results are recorded in:

`deployment/architecture/tenant-website-publish-readiness/v2-8-31-contact-admin-persistence-local-implementation-result/validation-summary.md`

## Exact Next Approval

The exact next approval is folded into:

`deployment/architecture/tenant-website-publish-readiness/v2-8-31-contact-admin-persistence-local-implementation-result/next-phase-prompt.md`

## Exact-Path Commit Instructions

```powershell
git add -- "PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_31_CONTACT_ADMIN_PERSISTENCE_LOCAL_IMPLEMENTATION_REPORT.md" "deployment/architecture/tenant-website-publish-readiness/v2-8-31-contact-admin-persistence-local-implementation-result" "deployment/static-azure/forms/static-form-endpoint-compat/contact-handler.mjs" "deployment/static-azure/forms/static-form-endpoint-compat/validate-static-form-payload.mjs" "deployment/static-azure/forms/static-form-endpoint-compat/test-static-form-endpoint-compat.mjs"
git commit -m "Implement V2.8.31 contact admin persistence path"
```
