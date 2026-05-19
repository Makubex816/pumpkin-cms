# Azure Static Web Apps Runbook

This runbook is a planning document. It does not contain deployment tokens and does not perform deployment.

## Resource Names

Suggested production resource names:

- `swa-ice-rink-rentals-prod`
- `swa-roller-rink-rentals-prod`

Optional staging resource names:

- `swa-ice-rink-rentals-staging`
- `swa-roller-rink-rentals-staging`

## Before Creating Resources

Confirm:

- `npm run publish:dry-run` passes.
- Dry-run manifest and summary have been reviewed.
- No `.env.local` or `appsettings.Development.json` changes are present.
- Static form endpoint decision is documented.
- Timothy has chosen Static Web Apps as the first hosting path.

## Create Azure Static Web App For Ice

1. Open Azure Portal.
2. Create a new Static Web App.
3. Use placeholder resource name `swa-ice-rink-rentals-prod`.
4. Choose the Azure subscription and resource group.
5. Choose the target region.
6. Select a deployment source appropriate for manual/staged rollout.
7. If connecting GitHub later, do not commit generated workflows in this phase.
8. Record the resource name, resource group, default hostname, and deployment method in a private deployment note.

## Create Azure Static Web App For Roller

1. Create a second Static Web App.
2. Use placeholder resource name `swa-roller-rink-rentals-prod`.
3. Keep it separate from the Ice resource for isolation and rollback.
4. Record the resource name, resource group, default hostname, and deployment method in a private deployment note.

## Build Settings

The current app produces prebuilt static folders through:

```powershell
cd apps/ice-rink-web
npm run publish:dry-run
```

Upload roots from the dry run:

```text
.static-release-dry-runs/<run-id>/ice-rink-rentals/
.static-release-dry-runs/<run-id>/roller-rink-rentals/
```

If GitHub deployment is added later, use a prebuilt upload flow. The future workflow should:

- install `apps/ice-rink-web` dependencies
- run `npm run publish:dry-run`
- select the correct per-site folder
- upload the prebuilt artifact
- keep deployment tokens in GitHub secrets only

Do not put deployment tokens in repo files.

## Required Static Build Inputs

Ice build uses:

```text
PUMPKIN_RENDER_MODE=static
SITE_KEY=ice-rink-rentals
STATIC_CONTENT_SOURCE=seed-sites
```

Roller build uses:

```text
PUMPKIN_RENDER_MODE=static
SITE_KEY=roller-rink-rentals
STATIC_CONTENT_SOURCE=seed-sites
```

These are already handled by the npm scripts.

## Custom Domain Setup

For Ice:

- `iceskatingrinkrentals.com`
- optional `www.iceskatingrinkrentals.com`

For Roller:

- `rollerrinkrentals.com`
- optional `www.rollerrinkrentals.com`

Recommended approach:

1. Start with staging subdomains.
2. Validate content, routing, canonical tags, sitemap, robots, and forms.
3. Move to production domains only after staging passes.

## Validation Checklist

For each Static Web App:

- `/` returns the correct site.
- primary rental route returns `index.html`.
- `/contact` returns `index.html`.
- `/sitemap.xml` is present.
- `/robots.txt` is present.
- canonical URLs match the intended domain.
- no opposite-domain canonical leakage exists.
- static form behavior is understood.
- Cloudflare cache is not hiding failed deployment results.

## Rollback Notes

Keep each dry-run release folder tied to:

- git commit SHA
- run ID
- generated timestamp
- target site key

Rollback means re-uploading the previous known-good static artifact and purging Cloudflare after upload succeeds.

## No-Secrets Warning

Never commit:

- Azure Static Web Apps deployment tokens
- Azure publish profiles
- Cloudflare API tokens
- storage connection strings
- `.env.local`
- `appsettings.Development.json`
