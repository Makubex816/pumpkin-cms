# Chosen Staging Path

Generated: 2026-06-06

## Decision

Option A is selected: use Azure Static Web Apps staging for Ice only, with the Azure default hostname validated before any custom staging domain or production DNS work.

Exact future target:

```text
resource group: rg-pumpkin-static-staging
Static Web App: swa-ice-rink-rentals-staging
region: eastus unless explicitly changed
site key: ice-rink-rentals
artifact root: apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out
first host: <Azure-generated default hostname>
```

A later resource creation approval superseded those planning placeholder names with this created staging target:

```text
resource group: rg-ice-static-staging
Static Web App: swa-ice-static-staging
region: eastus2
site key: ice-rink-rentals
artifact root: apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out
first host: happy-mud-0b375e20f.7.azurestaticapps.net
```

The Static Web App now exists, but static artifact deployment still requires separate approval.

This decision does not approve resource creation, deployment, DNS changes, Cloudflare changes, Function setting changes, CMS writes, MediaAsset writes, email sending, or Roller work.

## Future Deployment Shape

Manual SWA CLI shape, documentation only:

```powershell
swa deploy "apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out" --deployment-token "<ICE_STAGING_SWA_DEPLOYMENT_TOKEN>" --env production
```

This command was not run.

If GitHub Actions is later selected, use the inactive template pattern only after explicit approval:

```text
deployment/static-azure/github-actions-examples/ice-staging-swa.yml.example
```

Required GitHub secret placeholder:

```text
AZURE_STATIC_WEB_APPS_API_TOKEN_ICE_STAGING
```

Do not commit workflow activation or deployment tokens without separate approval.

## Default-Host First

The first staging validation should use the Azure-generated default hostname only. Do not change:

- `iceskatingrinkrentals.com`
- `www.iceskatingrinkrentals.com`
- Cloudflare root/www records
- staging DNS records

Custom staging domain work is a separate approval after the default host passes.

## Form-Origin Note

The static output is already configured with:

```text
https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
```

The endpoint is production-ready for the approved endpoint/config. Browser form submission from a new Azure default hostname may require adding that hostname to the Function allowed-origin setting after the SWA default hostname is known. That is a separate Function App setting approval and is not part of this preflight.

The first staging smoke test should load the form UI and use safe `OPTIONS` checks only unless a later approval explicitly authorizes a valid test submission and any required allowed-origin update.
