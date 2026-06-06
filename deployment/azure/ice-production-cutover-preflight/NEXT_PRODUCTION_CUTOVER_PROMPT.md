# Next Production Cutover Prompt

Generated: 2026-06-06

Use only when ready to approve production cutover execution.

```text
Approve Ice production root/www cutover execution only: use existing Azure Static Web App swa-ice-static-staging in rg-ice-static-staging as the custom-domain target, bind iceskatingrinkrentals.com and www.iceskatingrinkrentals.com if Azure validation succeeds, add only the required Cloudflare validation/root/www DNS records, keep media/MX/TXT/autodiscover records unchanged, keep root as canonical, either add an approved www-to-root redirect or explicitly defer that redirect, run production smoke tests for /, /contact, /service-areas, sitemap.xml, robots.txt, obsolete routes, media, canonical/noindex, assets, and safe form OPTIONS checks only, and document rollback/results. No CMS writes, no MediaAsset writes, no Function setting changes, no endpoint redeploy, no valid form submission, no email sending, no Microsoft 365 changes, no static deployment, no production-named Azure resource creation, and Roller remains paused.
```

If a production-named Static Web App is required first, use a separate approval before cutover execution.
