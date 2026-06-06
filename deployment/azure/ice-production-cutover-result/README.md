# Ice Production Custom Domain and DNS Cutover Result

Generated: 2026-06-06

## Result

Ice production custom-domain and root/www DNS cutover completed successfully.

| Area | Result |
| --- | --- |
| Azure Static Web App | `swa-ice-static-staging` |
| resource group | `rg-ice-static-staging` |
| default hostname | `happy-mud-0b375e20f.7.azurestaticapps.net` |
| apex custom domain | `iceskatingrinkrentals.com` Ready |
| www custom domain | `www.iceskatingrinkrentals.com` Ready |
| Cloudflare root DNS | DNS-only CNAME to Azure default hostname |
| Cloudflare www DNS | DNS-only CNAME to Azure default hostname |
| production HTTPS smoke | pass |
| strict static output validator | pass, 42 files, 0 errors, 0 warnings |
| strict staging package validator | pass, 42 files, 0 errors, 0 warnings |
| valid form submission | not sent |
| email | not sent |
| Roller | paused |

## Files

- `PRE_CUTOVER_AZURE_CHECK.md`
- `PRE_CUTOVER_CLOUDFLARE_DNS_CHECK.md`
- `PRE_CUTOVER_PUBLIC_BASELINE.md`
- `AZURE_CUSTOM_DOMAIN_BINDING_RESULT.md`
- `CLOUDFLARE_DNS_CUTOVER_RESULT.md`
- `POST_CUTOVER_DNS_HTTPS_VALIDATION.md`
- `PRODUCTION_SMOKE_TEST_RESULT.md`
- `VALIDATOR_RESULT.md`
- `CANONICAL_REDIRECT_RESULT.md`
- `ROLLBACK_PLAN.md`
- `REMAINING_PRODUCTION_BLOCKERS.md`
- `NEXT_INDEXING_APPROVAL_REQUIRED.md`
- `manifest.json`

## Boundary Confirmation

No CMS writes, MediaAsset writes, Function setting changes, endpoint redeploys, new static deployments, production artifact rebuilds, Cloudflare changes outside the approved DNS records, Microsoft 365 changes, valid form submissions, email sending, protected config reads, or Roller work were performed.

Cloudflare TXT values used for Azure validation were not written to this repository.

## Post-Cutover Indexing Cleanup Update

The later-approved indexing cleanup and static redeploy cleared hidden CMS workflow/review payload strings from live public HTML and aligned sitemap URLs with canonical trailing-slash behavior.

Search Console submission was not performed and still requires separate approval. See `deployment/azure/ice-production-indexing-cleanup-result/`.

## Reference

Azure Static Web Apps custom-domain requirements were checked against Microsoft documentation:

- https://learn.microsoft.com/en-us/azure/static-web-apps/custom-domain
- https://learn.microsoft.com/en-us/azure/static-web-apps/apex-domain-external
- https://learn.microsoft.com/en-us/azure/static-web-apps/custom-domain-external
