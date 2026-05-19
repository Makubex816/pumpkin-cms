# Pumpkin Azure SWA Staging Dry Run Phase 5G Report

## Executive Summary

Phase 5G prepares the Azure Static Web Apps staging dry-run workflow for the approved Option C deployment direction. Timothy approved Azure Static Web Apps as the first deployment target, Ice staging first, Roller staging second, and staging subdomains before live domains.

This phase does not deploy anything. It adds staging runbooks, inactive GitHub Actions templates, a Static Web Apps config template, DNS planning, validation planning, and this report.

## Files Added

- `deployment/static-azure/ice-staging-swa-runbook.md`
- `deployment/static-azure/roller-staging-swa-runbook.md`
- `deployment/static-azure/github-actions-examples/ice-staging-swa.yml.example`
- `deployment/static-azure/github-actions-examples/roller-staging-swa.yml.example`
- `deployment/static-azure/staticwebapp.config.template.json`
- `deployment/static-azure/staging-dns-checklist.md`
- `deployment/static-azure/staging-validation-checklist.md`
- `PUMPKIN_AZURE_SWA_STAGING_DRY_RUN_PHASE5G_REPORT.md`

## Approved Deployment Direction

Approved direction:

- Azure Static Web Apps is the first deployment target.
- Ice staging goes first.
- Roller staging goes second.
- Staging subdomains are used before live domains.

Staging domains:

- `ice-dev.iceskatingrinkrentals.com`
- `roller-dev.rollerrinkrentals.com`

Azure resource placeholders:

- `swa-ice-rink-rentals-staging`
- `swa-roller-rink-rentals-staging`

## Ice Staging Plan

Ice staging runbook:

```text
deployment/static-azure/ice-staging-swa-runbook.md
```

The runbook covers:

- Azure Portal steps
- resource group placeholder
- Static Web App placeholder name
- region guidance
- GitHub connection approach
- manual static artifact notes
- static build inputs
- validation checklist
- no-secrets warning

## Roller Staging Plan

Roller staging runbook:

```text
deployment/static-azure/roller-staging-swa-runbook.md
```

The runbook follows Ice staging and adds Roller-specific checks, including review of local-proof content warnings before broad staging review.

## Workflow Template Notes

Inactive templates were added under:

```text
deployment/static-azure/github-actions-examples/
```

Templates:

- `ice-staging-swa.yml.example`
- `roller-staging-swa.yml.example`

They are copy/paste-ready examples, but they are not active workflows. They use placeholder secret names only:

- `AZURE_STATIC_WEB_APPS_API_TOKEN_ICE_STAGING`
- `AZURE_STATIC_WEB_APPS_API_TOKEN_ROLLER_STAGING`

Before activation, Timothy must verify:

- `app_location`
- `output_location`
- `skip_app_build`
- dry-run folder selection
- Azure Static Web Apps resource token storage

## DNS Checklist Summary

Staging DNS checklist:

```text
deployment/static-azure/staging-dns-checklist.md
```

It requires Cloudflare DNS export/screenshots before any change, recommends DNS-only first for Azure validation, documents placeholder CNAME targets, and explicitly says not to alter live root/apex domains.

## Static Web App Config Template Summary

Template:

```text
deployment/static-azure/staticwebapp.config.template.json
```

It includes:

- conservative global security headers
- long-cache starter rule for `/_next/static/*`
- no-cache starter rules for HTML, sitemap, and robots
- 404 response override

The template must be reviewed and copied into the built static output root only if the Azure Static Web Apps deployment needs it.

## Staging Validation Summary

Validation checklist:

```text
deployment/static-azure/staging-validation-checklist.md
```

It covers:

- staging homepage
- main service page
- contact page
- sitemap
- robots
- canonical behavior
- static form limitation or staging endpoint behavior
- static assets
- page-source secret checks
- `CMS LIVE` marker checks
- Cloudflare headers if proxied

## What Still Requires Manual Azure Action

Manual steps still required:

- create `swa-ice-rink-rentals-staging`
- validate Ice staging
- create `swa-roller-rink-rentals-staging`
- validate Roller staging
- add staging DNS records in Cloudflare only after Azure provides target values
- store any deployment tokens in Azure/GitHub secret storage only

## What Must Not Be Committed

Do not commit:

- Azure Static Web Apps deployment tokens
- Azure publish profiles
- Cloudflare account IDs or API tokens
- real DNS export files with account-specific data
- `.env.local`
- `appsettings.Development.json`
- active `.github/workflows/*.yml` files from these examples

## Next Step

Next manual step:

```text
Timothy creates the Ice staging Static Web App resource using deployment/static-azure/ice-staging-swa-runbook.md.
```

After Ice staging passes, repeat with the Roller staging runbook.

## Validation Results

Checks run:

- `git diff --check`: passed
- trailing whitespace scan on new docs/templates: passed
- high-confidence secret-pattern scan on new docs/templates: passed
- `.github/workflows` check: no workflow directory present
- protected file check: no `.env.local` or `appsettings.Development.json` changes reported
- `staticwebapp.config.template.json` parse check: passed

No Azure deployment, Cloudflare change, DNS change, or app behavior change was performed.
