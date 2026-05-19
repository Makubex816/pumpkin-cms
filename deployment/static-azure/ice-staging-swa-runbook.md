# Ice Staging Azure Static Web Apps Runbook

This runbook prepares a manual staging deployment for Ice Skating Rink Rentals. It does not create Azure resources and does not include deployment tokens.

## Target

- Site: Ice Skating Rink Rentals
- Site key: `ice-rink-rentals`
- Staging domain: `ice-dev.iceskatingrinkrentals.com`
- Azure Static Web App placeholder: `swa-ice-rink-rentals-staging`
- Resource group placeholder: `rg-pumpkin-static-staging`

## Region Guidance

Choose an Azure Static Web Apps region appropriate for the expected visitor base and Azure account policy. Keep Ice and Roller staging in the same region unless there is a clear reason to separate them.

## Before Creating The App

Confirm:

- Timothy approved Azure Static Web Apps as the first deployment target.
- Ice staging is the first staging target.
- `npm run publish:dry-run` passes locally.
- The dry-run manifest has no secret-scan errors.
- No `.env.local` or `appsettings.Development.json` changes are present.
- No active workflow files are being committed under `.github/workflows`.

## Azure Portal Steps

1. Open Azure Portal.
2. Create a new Static Web App.
3. Use resource group placeholder `rg-pumpkin-static-staging`.
4. Use app name `swa-ice-rink-rentals-staging`.
5. Select the approved region.
6. Choose the plan appropriate for staging.
7. For deployment source, prefer a manual or later-connected GitHub flow.
8. Do not paste deployment tokens into repo files.
9. Record the generated default hostname in a private deployment note.

## GitHub Connection Approach

Recommended staging approach:

1. Keep the workflow template inactive under `deployment/static-azure/github-actions-examples/`.
2. Review it with Timothy.
3. Copy it into `.github/workflows/` only in a later deployment-automation phase.
4. Store the deployment token as `AZURE_STATIC_WEB_APPS_API_TOKEN_ICE_STAGING` in GitHub secrets.
5. Never commit the token value.

Inactive template:

```text
deployment/static-azure/github-actions-examples/ice-staging-swa.yml.example
```

## Manual Artifact Notes

Local dry-run upload root:

```text
.static-release-dry-runs/<run-id>/ice-rink-rentals/
```

If using a manual CLI upload later, deploy the contents of that folder as the prebuilt static app. Keep any deployment token in local secret storage or GitHub/Azure secret storage, not in docs or scripts.

## Build And Output Settings

Static build inputs:

```text
PUMPKIN_RENDER_MODE=static
SITE_KEY=ice-rink-rentals
STATIC_CONTENT_SOURCE=seed-sites
```

Current command:

```powershell
cd apps/ice-rink-web
npm run publish:dry-run
```

Expected dry-run site folder:

```text
.static-release-dry-runs/<run-id>/ice-rink-rentals/
```

If using Azure Static Web Apps GitHub Action later:

- verify `app_location`
- verify `output_location`
- verify `skip_app_build`
- verify the selected dry-run folder before activation

## Static Web App Config

If Azure Static Web Apps needs a config file in the artifact root, copy and review:

```text
deployment/static-azure/staticwebapp.config.template.json
```

Copy it into the built static output root only after verifying routes, headers, and fallback behavior.

## Custom Domain Setup

Staging domain:

```text
ice-dev.iceskatingrinkrentals.com
```

Do not alter:

- `iceskatingrinkrentals.com`
- `www.iceskatingrinkrentals.com`

Use the staging DNS checklist before making any Cloudflare DNS change.

## Validation Checklist

After staging deployment, verify:

- `https://ice-dev.iceskatingrinkrentals.com/`
- `https://ice-dev.iceskatingrinkrentals.com/ice-rink-rentals`
- `https://ice-dev.iceskatingrinkrentals.com/events-holiday-activations`
- `https://ice-dev.iceskatingrinkrentals.com/contact`
- `https://ice-dev.iceskatingrinkrentals.com/sitemap.xml`
- `https://ice-dev.iceskatingrinkrentals.com/robots.txt`

Also verify:

- static assets load
- no live-domain cutover occurred
- page source contains no obvious secrets
- no `CMS LIVE` markers appear
- form behavior is understood if no static endpoint is configured
- canonical behavior is reviewed before sharing staging widely

## No-Secrets Warning

Never commit:

- Azure Static Web Apps deployment token
- Azure publish profile
- Cloudflare token
- `.env.local`
- `appsettings.Development.json`
