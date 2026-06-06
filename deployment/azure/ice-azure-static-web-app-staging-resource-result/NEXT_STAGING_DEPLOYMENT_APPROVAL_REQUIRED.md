# Next Staging Deployment Approval Required

Generated: 2026-06-06

## Next Gate

The next approval should be scoped to Ice Azure Static Web Apps default-host static artifact deployment only.

Exact target:

```text
resource group: rg-ice-static-staging
Static Web App: swa-ice-static-staging
default hostname: happy-mud-0b375e20f.7.azurestaticapps.net
artifact root: apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out
```

The future deployment should use the already validated static artifact and then smoke test only the Azure default hostname.

## Still Excluded Unless Separately Approved

- production deployment
- root/www DNS changes
- Cloudflare changes
- custom staging domain
- CMS writes
- MediaAsset writes
- Function App setting changes
- endpoint redeployment
- valid form submission
- email sending
- Microsoft 365 changes
- production cutover
- Roller work

No deployment command was run in this resource-creation pass.
