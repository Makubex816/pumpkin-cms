# Pre-Cutover Azure Check

Generated: 2026-06-06

## Existing Target

| Field | Value |
| --- | --- |
| resource group | `rg-ice-static-staging` |
| static web app | `swa-ice-static-staging` |
| default hostname | `happy-mud-0b375e20f.7.azurestaticapps.net` |
| SKU | Free |
| provider | `SwaCli` |
| environment | default |
| environment status | Ready |
| stable inbound IP | none returned |
| custom hostnames before cutover | none |

## Decision

Because the Static Web App did not expose a stable inbound IP, the cutover used hostname-based DNS:

- apex/root through Cloudflare CNAME flattening to `happy-mud-0b375e20f.7.azurestaticapps.net`
- `www` CNAME to `happy-mud-0b375e20f.7.azurestaticapps.net`

This matched the Azure Static Web Apps external DNS guidance that favors ALIAS/ANAME/CNAME-style apex records over A records where supported.

## Boundary

No Azure resource creation, new static deployment, Function setting change, endpoint redeploy, production DNS mutation, or CMS/MediaAsset work occurred during this pre-check.
