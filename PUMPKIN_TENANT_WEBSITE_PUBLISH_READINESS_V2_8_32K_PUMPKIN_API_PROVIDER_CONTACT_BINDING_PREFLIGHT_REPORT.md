# PUMPKIN Tenant Website Publish Readiness V2.8.32K Pumpkin API Provider Contact Binding Preflight Report

Date: 2026-06-27

Status: completed for approved binding preflight and Static Web App contact binding. The contact gate remains open pending a later approved live POST plus Admin FormEntry readback.

Lane: V2.8 Tenant Website / Post-Release Contact Verification + Pumpkin Live Runtime Wiring

Classification: `provider_contact_binding_preflight_static_contact_admin_persistence_binding_no_post`

## Summary

V2.8.32K inspected the approved source paths, confirmed the V2.8.30 `admin-persistence-required` carryforward, confirmed the V2.8.32J health-passing canonical Pumpkin API URL, locked Azure to subscription `ff887def-fd83-4a19-9298-13d4b1687873`, verified the selected Pumpkin API Web App and production-bound Static Web App, and bound the production Static Web App contact endpoint to Pumpkin API mode using exact source-discovered setting names.

No contact form was submitted. No live FormEntry write/read validation and no Admin live readback occurred.

## Carryforward

V2.8.30 selected `admin-persistence-required`: accepted contact submissions must create Pumpkin `FormEntry` records in the same backend read by Admin. Email-only delivery does not close the gate.

V2.8.32J promoted the canonical Pumpkin API URL after both health routes returned 200:

`https://app-pumpkin-api-prod-centralus-001.azurewebsites.net`

## Subscription And Targets

Subscription lock passed:

- Subscription ID: `ff887def-fd83-4a19-9298-13d4b1687873`
- Subscription name: `Azure subscription 1`
- Operator user: `Contact@iceskatingrinkrentals.com`

Pumpkin API target confirmed:

- Web App: `app-pumpkin-api-prod-centralus-001`
- Resource group: `rg-pumpkin-api-prod-centralus`
- Default host: `app-pumpkin-api-prod-centralus-001.azurewebsites.net`
- State: `Running`
- Runtime metadata checked without appsetting list/show.

Static contact target confirmed:

- Static Web App: `swa-ice-static-staging`
- Resource group: `rg-ice-static-staging`
- Default hostname: `happy-mud-0b375e20f.7.azurestaticapps.net`
- Production hostnames: `iceskatingrinkrentals.com` and `www.iceskatingrinkrentals.com`, both `Ready`

## Source-Discovered Setting Map

Static contact `pumpkin-api` mode uses:

- `FORM_DELIVERY_MODE`
- `PUMPKIN_API_URL`
- `PUMPKIN_CONTACT_PROTECTED_KEY_ENV_NAME`
- `PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY`
- `PUMPKIN_CONTACT_PUMPKIN_API_WRITE_ROUTE`
- `STATIC_FORM_ALLOWED_SITE_KEYS`
- `STATIC_FORM_ALLOWED_ORIGINS`

Pumpkin API FormEntry/Admin source uses:

- `POST /api/forms/{tenantId}/entries`
- `GET /api/admin/{tenantId}/form-entries`
- `Database__Provider`
- `Database__CosmosDb__ConnectionString`
- `Database__CosmosDb__DatabaseName`
- `Jwt__SecretKey`
- `Jwt__Issuer`
- `Jwt__Audience`
- `Jwt__ExpirationMinutes`

`PUMPKIN_API_FORMENTRY_PROVIDER_BINDING_SECRET` is not a source-confirmed Pumpkin API app-setting name. It was used only as an operator-provided presence/match check against `PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY`; its value was not printed and was not written to the Pumpkin API Web App.

## Binding Result

Pre-mutation decision: go for exact Static Web App contact binding only.

Static SWA appsetting binding: completed for exact source-confirmed settings:

- `FORM_DELIVERY_MODE`
- `PUMPKIN_API_URL`
- `PUMPKIN_CONTACT_PUMPKIN_API_WRITE_ROUTE`
- `PUMPKIN_CONTACT_PROTECTED_KEY_ENV_NAME`
- `PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY`
- `STATIC_FORM_ALLOWED_SITE_KEYS`
- `STATIC_FORM_ALLOWED_ORIGINS`

Pumpkin API Web App appsetting binding: not run. Source does not support binding the tenant API key through a Pumpkin API app setting; FormEntry writes validate the Bearer key against the tenant record in the configured database.

## Readiness

Only the approved GET readiness URLs were checked.

| URL | Result |
| --- | --- |
| `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/health` | `200`, `ok:true`, `service:pumpkin-api`, `providerStatus:not_checked` |
| `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/health` | `200`, `ok:true`, `service:pumpkin-api`, `providerStatus:not_checked` |
| `https://iceskatingrinkrentals.com/api/static-contact-health` | `200`, `ok:true`, `service:static-contact`, `contactRoute:/api/static-contact` |

The static health route is a sentinel and does not introspect delivery mode. Admin persistence remains unproven until the separately approved live POST plus Admin readback gate runs.

## Safety Confirmation

No deployment, redeployment, SWA deploy, Web App deploy, contact POST, production API write, live FormEntry read/write, Admin live readback, app settings list/show, protected config read, Key Vault query, keys/listKeys, connection string/SAS generation, DNS/custom-domain mutation, Search Console/indexing action, deployment-token action, or provider/inbox login occurred.

## Files

Result package:

`deployment/architecture/tenant-website-publish-readiness/v2-8-32k-pumpkin-api-provider-contact-binding-preflight-result/`

Next approval prompt:

`deployment/architecture/tenant-website-publish-readiness/v2-8-32k-pumpkin-api-provider-contact-binding-preflight-result/next-phase-prompt.md`

## Validation

Validation passed:

- Static compat local tests passed.
- Pumpkin API source route/auth shape test passed with an isolated output path after the normal Debug output was locked by an existing local `pumpkin-api` process.
- `result-manifest.json` parsed.
- Required package files are present.
- `git diff --check` passed.
- No files are staged.

## Exact-Path Commit Instructions

```powershell
git add -- "PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_32K_PUMPKIN_API_PROVIDER_CONTACT_BINDING_PREFLIGHT_REPORT.md" "deployment/architecture/tenant-website-publish-readiness/v2-8-32k-pumpkin-api-provider-contact-binding-preflight-result"
git commit -m "Record V2.8.32K contact binding preflight"
```
