# Rollback Notes

Generated: 2026-06-06

## Rollback Scope

The approved cleanup changed local rendering/sitemap source code and, after later approval, redeployed static content to the existing Azure Static Web App.

No DNS, Cloudflare, Azure resource/config, Function setting, CMS, MediaAsset, email, Microsoft 365, or Roller changes were made.

## Fast Content Rollback

If the cleanup deployment must be rolled back, redeploy the previously known-good Ice static artifact to the existing Static Web App:

```text
Static Web App: swa-ice-static-staging
resource group: rg-ice-static-staging
default hostname: happy-mud-0b375e20f.7.azurestaticapps.net
production custom domains: iceskatingrinkrentals.com, www.iceskatingrinkrentals.com
```

Use Azure Static Web Apps deployment history or a preserved pre-cleanup static artifact if available. Keep deployment tokens out of repo files and command output.

## Source Rollback Shape

If source rollback is required, revert only the cleanup source changes:

- `apps/ice-rink-web/src/lib/public-render-page.ts`
- `apps/ice-rink-web/src/app/page.tsx`
- `apps/ice-rink-web/src/app/[...slug]/page.tsx`
- `apps/ice-rink-web/src/components/PageRenderer.tsx`
- `apps/ice-rink-web/src/lib/metadata.ts`
- `apps/ice-rink-web/scripts/static-publish.mjs`

Then rerun export, validators, and a separately approved static redeploy.

## What Not To Change During Rollback

Do not change:

- Cloudflare DNS
- Azure custom-domain bindings
- Function App settings
- CMS records
- MediaAsset records
- Microsoft 365 settings
- email delivery settings
- Roller assets or routes
