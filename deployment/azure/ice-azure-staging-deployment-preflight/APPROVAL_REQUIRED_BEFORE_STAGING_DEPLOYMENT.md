# Approval Required Before Staging Deployment

Generated: 2026-06-06

## Current Boundary

Option A, Azure Static Web Apps default-host staging, is selected as the path.

This preflight did not approve or perform:

- Azure resource creation
- Azure Static Web App creation
- deployment
- DNS changes
- Cloudflare changes
- CMS writes
- MediaAsset writes
- Function App setting changes
- endpoint redeployment
- email sending
- Microsoft 365 changes
- production cutover
- root/www DNS changes
- protected config reads
- Roller work

## Required Next Approval

A future approval must explicitly state whether Codex may:

- create resource group `rg-pumpkin-static-staging`, if it does not exist
- create Static Web App `swa-ice-rink-rentals-staging`
- use `eastus` or another region
- read or use the SWA deployment token without printing it
- deploy the prebuilt Ice static artifact
- validate only the Azure default hostname
- run safe public staging smoke tests

## Separate Approvals Still Required

These must remain separate unless the user explicitly combines them:

- adding custom staging DNS
- changing Cloudflare records or cache rules
- changing Function App allowed origins
- sending a valid contact form payload
- sending any email
- deploying to production
- changing root/apex or `www` DNS
- updating CMS content/theme/navigation
- updating MediaAsset records
- touching Roller

## Safe Next Deployment Boundary

The safest next boundary is:

```text
Ice Azure Static Web Apps default-host staging only.
```

That means no custom domain, no production DNS, no Cloudflare changes, no Function settings changes, no email, no CMS writes, no MediaAsset writes, and Roller remains paused.
