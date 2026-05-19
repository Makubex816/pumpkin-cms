# Pumpkin Production Static Deployment Decision Phase 5F Report

## Executive Summary

Phase 5F creates the final pre-deployment decision package for the Option C static-first publishing workflow. The system is ready for a controlled staging-first deployment decision, but no real Azure deployment, Cloudflare change, DNS change, or active GitHub Actions workflow was added.

Recommended first deployment option: **Azure Static Web Apps, staging first**.

The safest next move is for Timothy to approve or reject that recommendation before any infrastructure is changed.

## Current System Readiness

Ready locally:

- Admin page editor MVP exists.
- Page lifecycle controls exist.
- JSON import/export exists.
- CSV/XLSX import/export exists.
- Static export mode works.
- Azure/Cloudflare readiness docs exist.
- Static form endpoint strategy exists.
- Static publish dry-run workflow exists.
- `npm run publish:dry-run` creates validated per-site release folders.

Still not live:

- No Azure resources have been created by this work.
- No Azure Static Web Apps deployment has been performed.
- No Azure Storage static website deployment has been performed.
- No Cloudflare settings have been changed.
- No production DNS has been changed.
- No production static form endpoint has been deployed.

## What Is Proven Locally

Ice Skating Rink Rentals:

- Site key: `ice-rink-rentals`
- Domain target: `iceskatingrinkrentals.com`
- Static routes validated:
  - `/`
  - `/ice-rink-rentals`
  - `/events-holiday-activations`
  - `/contact`
  - `/sitemap.xml`
  - `/robots.txt`

Roller Rink Rentals:

- Site key: `roller-rink-rentals`
- Domain target: `rollerrinkrentals.com`
- Static routes validated:
  - `/`
  - `/roller-rink-rentals`
  - `/contact`
  - `/sitemap.xml`
  - `/robots.txt`

The dry-run package verifies required files, sitemap domains, robots output, canonical separation, forbidden env/config files, and high-confidence secret patterns.

## Deployment Options

Option 1: Azure Static Web Apps

- Best first staging path.
- Managed custom domains and HTTPS are simpler.
- Good fit for prebuilt static output.
- Strong fit for future GitHub automation.
- Recommended score: `9/10`.

Option 2: Azure Storage Static Website + Cloudflare

- Good low-level static file hosting.
- Strong Cloudflare fit.
- More care needed for custom-domain HTTPS and upload/sync behavior.
- Recommended score: `7/10`.

Option 3: Hold Deployment And Keep Building

- Best if content, forms, or publishing UX should block public staging.
- Avoids infrastructure changes now.
- Delays real hosting feedback.
- Recommended score: `6/10`.

See `deployment/static-azure/deployment-option-comparison.md` for the detailed comparison.

## Recommended First Deployment Option

Choose **Azure Static Web Apps, staging first**.

Use staging domains:

- `ice-dev.iceskatingrinkrentals.com`
- `roller-dev.rollerrinkrentals.com`

Then deploy to production domains only after route, sitemap, robots, canonical, form, cache, and rollback checks pass.

## Why This Is Safest

Azure Static Web Apps is safest for the first real hosted proof because:

- custom-domain and HTTPS setup is simpler than raw Storage static website hosting
- each site can have its own isolated resource
- the current dry-run folders map cleanly to prebuilt static artifacts
- future GitHub automation is straightforward
- rollback can use prior validated artifacts
- Cloudflare can be introduced carefully after the Azure origin is proven

## Risks

- Roller content still contains local-proof language that should be reviewed before production launch.
- Static form submissions need a real external endpoint before public lead capture works.
- Cloudflare HTML caching should stay conservative until purge automation is proven.
- DNS cutover can affect live traffic if done before staging validation.
- Staging canonical behavior must be understood to avoid SEO confusion.

## Blockers

Hard blockers for production launch:

- Timothy must choose the hosting option.
- A staging or production static form endpoint decision must be made.
- Azure resources must be created manually or through later approved automation.
- Cloudflare/DNS rollback notes must be captured before cutover.

Soft blockers:

- Review and clean local-proof copy before broad public sharing.
- Decide whether staging should be noindex or access-limited.

## Exact Next Manual Step

Timothy should choose one of these:

1. **Approve Azure Static Web Apps staging-first** and create staging resources for Ice and Roller using the Static Web Apps runbook.
2. **Choose Azure Storage Static Website + Cloudflare** and follow the Storage runbook instead.
3. **Hold deployment** and prioritize content cleanup, form endpoint deployment, or admin publishing automation.

Recommended exact next manual step:

```text
Approve Option 1, then create the Ice staging Static Web App resource using deployment/static-azure/azure-static-web-apps-runbook.md.
```

## Files Added

- `deployment/static-azure/deployment-option-comparison.md`
- `deployment/static-azure/azure-static-web-apps-runbook.md`
- `deployment/static-azure/azure-storage-static-website-runbook.md`
- `deployment/static-azure/cloudflare-cutover-checklist.md`
- `deployment/static-azure/staging-first-plan.md`
- `deployment/static-azure/final-preflight-checklist.md`
- `PUMPKIN_PRODUCTION_STATIC_DEPLOYMENT_DECISION_PHASE5F_REPORT.md`

## Validation Results

Phase 5F is documentation-only. Checks run:

- `git diff --check`: passed
- trailing whitespace scan for new docs: passed
- high-confidence secret-pattern scan for new docs: passed
- active workflow check: no `.github/workflows` directory present
- protected file check: no `.env.local` or `appsettings.Development.json` changes reported

No app behavior was changed in Phase 5F.
