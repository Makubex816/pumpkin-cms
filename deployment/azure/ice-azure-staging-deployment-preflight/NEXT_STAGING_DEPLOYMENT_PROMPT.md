# Next Staging Deployment Prompt

Generated: 2026-06-06

Use this prompt only when ready to approve Azure staging deployment to the existing default-host resource.

```text
Approve Ice Azure Static Web Apps default-host staging deployment only: use existing resource group rg-ice-static-staging and Static Web App swa-ice-static-staging, deploy the prebuilt Ice artifact from apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out to default hostname happy-mud-0b375e20f.7.azurestaticapps.net, keep deployment tokens secret, run route/media/sitemap/robots/canonical/noindex/404 smoke tests and safe form OPTIONS checks only, document rollback and results. No custom DNS, no Cloudflare changes, no root/www DNS changes, no CMS writes, no MediaAsset writes, no Function App setting changes, no endpoint redeploy, no valid form submission, no email sending, no Microsoft 365 changes, no production deployment, and Roller remains paused.
```

If form submission testing from the Azure default hostname is required later, use a separate approval after the default hostname is known:

```text
Approve Ice static form staging-origin CORS verification only: review the Azure default staging hostname, determine whether the existing static form endpoint allows that origin, and if explicitly needed update only the approved Function allowed-origin setting to include the staging hostname, then run safe OPTIONS checks. No valid form submission, no email sending, no endpoint redeploy, no CMS/MediaAsset writes, no DNS/Cloudflare changes, no static deployment, and Roller remains paused.
```
