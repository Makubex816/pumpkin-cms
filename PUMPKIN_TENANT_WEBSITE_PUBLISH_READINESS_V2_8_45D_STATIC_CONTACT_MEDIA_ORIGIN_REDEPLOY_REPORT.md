# V2.8.45D Static Contact Media Origin Redeploy Report

Phase status: closed_success.

Lane: V2.8 Tenant Website / Pumpkin Live Platform Readiness.

Classification: static_contact_managed_api_redeployed_after_media_origin_validator_alignment.

## Carryforward

V2.8.45C stopped before any SWA deploy because the static package validators rejected the current live Azure Blob media origin. The managed API package itself was otherwise ready, but strict validation expected only `https://media.iceskatingrinkrentals.com`.

V2.8.45D used the updated approved secure-file scope:

- Retained V2.8.45C token handoff only if needed.
- V2.8.45D media-origin redeploy handoff for approved artifact validation and SWA deployment tokens.
- No V2.8.45B secure handoff was required or read.

## Root Cause

The blocker was validator drift, not a managed API source defect. The generated static output referenced an approved current live Azure Blob media origin, while the validators allowed only the older canonical media origin.

The source fix aligned:

- `deployment/static-azure/validate-static-output.mjs`
- `deployment/static-azure/validate-staging-package.mjs`

Both validators now allow the site media origin plus approved media origins supplied through `PUMPKIN_STATIC_APPROVED_MEDIA_ORIGINS` or `STATIC_APPROVED_MEDIA_ORIGINS`.

## Package And Deploy

- Sanitized static build completed successfully for `ice-rink-rentals`.
- Static output validation passed.
- Staging package validation passed.
- Static contact managed API route inclusion passed.
- Static contact compatibility tests passed.
- Isolated SWA deploy completed once and succeeded.
- Production SWA deploy completed once and succeeded.

No deployment token or static-contact key was printed or written to repo reports.

## Runtime Proof

Isolated:

- `https://kind-island-0a85a740f.7.azurestaticapps.net/api/static-contact-health`: HTTP 200.
- `https://kind-island-0a85a740f.7.azurestaticapps.net/`: HTTP 200.
- `https://kind-island-0a85a740f.7.azurestaticapps.net/contact`: HTTP 200.

Production:

- `https://iceskatingrinkrentals.com/api/static-contact-health`: HTTP 200.
- `https://www.iceskatingrinkrentals.com/api/static-contact-health`: HTTP 200.
- `https://happy-mud-0b375e20f.7.azurestaticapps.net/api/static-contact-health`: HTTP 200.
- Public `/`, `/contact`, and `/service-areas`: HTTP 200 on apex and www.
- Pumpkin API `/health` and `/api/health`: HTTP 200.
- Admin UI production `/` and `/login`: HTTP 200.

## Hardening Preservation

No diagnostic rollback was performed. The approved monitoring and storage posture remains in place:

- Static Web Apps diagnostic setting `diag-to-law-pumpkin-prod-001` present on production and isolated SWAs.
- App Service, Cosmos DB, media storage account, and media blob service diagnostic settings remain present.
- Log Analytics workspace `law-pumpkin-prod-centralus-001` remains `Succeeded`.
- Six metric alerts remain enabled.
- Action group `ag-pumpkin-prod-ops-email-001` remains enabled.
- Media storage blob soft delete, container soft delete, blob versioning, and change feed remain enabled.
- Cosmos backup policy remains `Continuous30Days`.

## Security Boundary

No contact POST occurred. No content write occurred. No DNS, custom-domain, or indexing mutation occurred. No Pumpkin API or Admin UI deploy occurred. No appsetting mutation occurred. No storage protection rollback occurred. No Key Vault read, storage key/listKeys, SAS generation, or connection string generation occurred.

## Files

Created:

- `deployment/architecture/tenant-website-publish-readiness/v2-8-45d-static-contact-media-origin-redeploy-result/`
- `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_45D_STATIC_CONTACT_MEDIA_ORIGIN_REDEPLOY_REPORT.md`

Modified:

- `deployment/static-azure/validate-static-output.mjs`
- `deployment/static-azure/validate-staging-package.mjs`

## Commit Instructions

Use exact-path staging only:

```powershell
git add deployment/static-azure/validate-static-output.mjs deployment/static-azure/validate-staging-package.mjs PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_45D_STATIC_CONTACT_MEDIA_ORIGIN_REDEPLOY_REPORT.md deployment/architecture/tenant-website-publish-readiness/v2-8-45d-static-contact-media-origin-redeploy-result
git commit -m "Recover V2.8.45D static contact managed API"
```
