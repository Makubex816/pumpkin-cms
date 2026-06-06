# Next Production Cutover Preflight Approval Required

Generated: 2026-06-06

## Recommended Next Gate

Before production cutover preflight, decide whether staging browser form submission must be tested from the Azure default hostname.

Safest next approval if form testing is required:

```text
Approve Ice static form staging-origin CORS update/verification only: add only the Azure Static Web Apps staging default hostname happy-mud-0b375e20f.7.azurestaticapps.net to the approved Function allowed-origin setting if required, run safe OPTIONS checks, and document results. No valid form submission, no email sending, no endpoint redeploy, no CMS/MediaAsset writes, no DNS/Cloudflare changes, no static deployment, no Microsoft 365 changes, and Roller remains paused.
```

After staging-origin form readiness is resolved or explicitly deferred, the next production gate should be preflight only:

```text
Approve Ice production cutover preflight only: review the deployed Azure Static Web Apps staging default host, strict validators, smoke results, DNS/Cloudflare requirements, rollback plan, indexing/canonical implications, and exact approval boundary for production cutover. No DNS changes, no Cloudflare changes, no production deployment, no CMS/MediaAsset writes, no Function setting changes, no email/Microsoft 365 work, and Roller remains paused.
```

## Not Yet Approved

- production DNS changes
- Cloudflare record or cache changes
- custom domain binding
- production deployment/cutover
- Function App setting changes
- valid form submission
- email sending
- Microsoft 365 changes
- CMS/MediaAsset writes
- Roller work
