# Deployment Target

Generated: 2026-06-06

## Target

| Item | Value |
| --- | --- |
| hosting | Azure Static Web Apps |
| resource group | `rg-ice-static-staging` |
| Static Web App | `swa-ice-static-staging` |
| location | `East US 2` |
| SKU | `Free` |
| default hostname | `happy-mud-0b375e20f.7.azurestaticapps.net` |
| deployment environment | `production` environment on the staging Static Web App |
| custom hostnames | none |

The `production` SWA environment here means the primary environment of the staging Azure Static Web App. It is not a production website/domain deployment.

## Confirmed Not Targeted

- `iceskatingrinkrentals.com`
- `www.iceskatingrinkrentals.com`
- any Cloudflare hostname
- any custom staging domain
- any Roller host
