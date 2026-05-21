# Azure Static Web Apps Staging Execution Prep

This runbook prepares Timothy to create and validate Azure Static Web Apps staging resources manually. It does not create Azure resources, change DNS, deploy to Azure, purge Cloudflare, or include deployment tokens.

## Current Static Commands

Run these from `apps/ice-rink-web`.

Ice CMS snapshot flow:

```powershell
npm run snapshot:cms:ice
npm run validate:snapshot:ice
npm run export:static:ice:cms
```

Roller CMS snapshot flow:

```powershell
npm run snapshot:cms:roller
npm run validate:snapshot:roller
npm run export:static:roller:cms
```

Full local dry run for both sites:

```powershell
npm run publish:dry-run:cms
```

Expected generated output paths:

```text
apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out
apps/ice-rink-web/.static-artifacts/roller-rink-rentals/out
.static-release-dry-runs/<runId>/ice-rink-rentals
.static-release-dry-runs/<runId>/roller-rink-rentals
```

## Staging Targets

### Ice

- resource name suggestion: `swa-ice-rink-rentals-staging`
- resource group placeholder: `rg-pumpkin-static-staging`
- site key: `ice-rink-rentals`
- tenant: `ice-rink-rentals`
- Azure default host: use first before custom domain
- custom staging domain later: `staging.iceskatingrinkrentals.com`
- alternate staging domain from earlier docs: `ice-dev.iceskatingrinkrentals.com`
- production domain later: `iceskatingrinkrentals.com`
- static upload root: `.static-release-dry-runs/<runId>/ice-rink-rentals`

### Roller

- resource name suggestion: `swa-roller-rink-rentals-staging`
- resource group placeholder: `rg-pumpkin-static-staging`
- site key: `roller-rink-rentals`
- tenant: `roller-rink-rentals`
- Azure default host: use after Ice validates
- custom staging domain later: `staging.rollerrinkrentals.com`
- alternate staging domain from earlier docs: `roller-dev.rollerrinkrentals.com`
- production domain later: `rollerrinkrentals.com`
- static upload root: `.static-release-dry-runs/<runId>/roller-rink-rentals`

Use the Azure default host first. Add staging custom domains only after the Azure origin is proven.

## Prerequisite Checklist

- repo clean except intentional staging-prep changes
- latest branch pushed when Timothy is ready
- Pumpkin API and admin verified locally if CMS snapshots are needed
- Ice CMS snapshot generated and validated
- Roller CMS snapshot generated and validated
- `npm run publish:dry-run:cms` completed
- dry-run manifest reviewed
- summary markdown reviewed
- `redirects.json` reviewed for each site
- no `.env.local` or `appsettings.Development.json` changes
- no active `.github/workflows/*.yml` added
- static form endpoint staging plan reviewed
- rollback checklist saved

## Azure Portal Steps: Ice First

1. Open Azure Portal.
2. Create a Static Web App.
3. Use placeholder resource group `rg-pumpkin-static-staging`.
4. Use app name `swa-ice-rink-rentals-staging`.
5. Select the approved region.
6. Choose the staging-appropriate plan.
7. Do not connect live DNS.
8. Do not paste deployment tokens into repo files.
9. Record the generated Azure default hostname in a private deployment note.
10. Validate the Azure default hostname before adding a custom staging domain.

## Azure Portal Steps: Roller Second

Repeat the Ice process only after Ice staging passes.

1. Create Static Web App `swa-roller-rink-rentals-staging`.
2. Use the same resource group and region unless Timothy approves otherwise.
3. Record the Azure default hostname privately.
4. Validate default-host staging before any custom domain work.

## Deployment Approach

Azure Static Web Apps does not work like a simple portal file browser. Use one of these controlled staging approaches later:

- SWA CLI with a deployment token kept outside the repo
- inactive GitHub Actions template copied into `.github/workflows/` only in a future deployment automation phase
- Azure Storage static website fallback if SWA upload flow becomes impractical

Do not run deploy commands during this prep phase.

## Optional SWA CLI Shape

Manual future command shape, with placeholders only:

```powershell
swa deploy ".static-release-dry-runs/<runId>/ice-rink-rentals" --deployment-token "<ICE_STAGING_TOKEN>" --env production
swa deploy ".static-release-dry-runs/<runId>/roller-rink-rentals" --deployment-token "<ROLLER_STAGING_TOKEN>" --env production
```

Do not commit tokens. Do not paste tokens into docs, scripts, shell history screenshots, or reports.

## App Settings Plan

For a prebuilt static frontend, there should be no browser-visible Pumpkin tenant API keys.

Public/static frontend values:

```text
NEXT_PUBLIC_STATIC_FORM_ENDPOINT=https://<staging-function-host>/api/contact
```

The value above is public by design and should be only a URL.

Static form endpoint / Azure Function app settings later:

```text
PUMPKIN_API_URL=<pumpkin-api-url>
ICE_RINK_RENTALS_API_KEY=<server-side-secret>
ROLLER_RINK_RENTALS_API_KEY=<server-side-secret>
STATIC_FORM_ALLOWED_ORIGINS=https://<azure-default-host>,https://staging.iceskatingrinkrentals.com,https://staging.rollerrinkrentals.com
STATIC_FORM_ALLOWED_SITE_KEYS=ice-rink-rentals,roller-rink-rentals
STATIC_FORM_DEFAULT_TENANT=<optional-staging-default>
STATIC_FORM_RATE_LIMIT_MODE=log_only
STATIC_FORM_SPAM_PROTECTION_MODE=honeypot_only
```

These are placeholders. Do not commit values.

## Pre-Upload Package Validation

Validate each release folder:

```powershell
node deployment/static-azure/validate-staging-package.mjs --site ice-rink-rentals --folder ".static-release-dry-runs/<runId>/ice-rink-rentals"
node deployment/static-azure/validate-staging-package.mjs --site roller-rink-rentals --folder ".static-release-dry-runs/<runId>/roller-rink-rentals"
```

Also run the existing static output validator:

```powershell
node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out ".static-release-dry-runs/<runId>/ice-rink-rentals"
node deployment/static-azure/validate-static-output.mjs --site roller-rink-rentals --out ".static-release-dry-runs/<runId>/roller-rink-rentals"
```

## Staging Validation

After upload/deploy later:

- default Azure hostname loads
- home page loads
- main service page loads
- contact page loads
- `sitemap.xml` loads
- `robots.txt` loads
- CSS/JS assets load
- page source contains no obvious secrets
- page source contains no localhost references
- old slug redirect behavior is tested if redirect records exist
- static form endpoint returns success
- Lead Inbox receives staging submissions
- no Next `/api/contact` route dependency exists from the static host
- no Cloudflare or live DNS change occurred

## Repeat Order

1. Ice Azure default host.
2. Ice staging form endpoint verification.
3. Ice optional staging custom domain.
4. Roller Azure default host.
5. Roller staging form endpoint verification.
6. Roller optional staging custom domain.

Live-domain cutover is a separate approval step.
