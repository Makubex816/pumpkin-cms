# Azure Static Web App Artifact Plan

## Target Artifact Shape

After blockers are cleared, the Ice staging artifact should be a prebuilt static folder:

```text
.static-release-dry-runs/<runId>/ice-rink-rentals/
```

Required files should include:

- `index.html`
- `contact/index.html`
- `service-areas/index.html`
- `sitemap.xml`
- `robots.txt`
- `_next/static/...`
- `redirects.json` if redirects are generated
- `static-publish-manifest.json`

## Required Command Sequence Later

Run only after a separate approval:

```powershell
cd apps/ice-rink-web
npm run snapshot:cms:ice
npm run validate:snapshot:ice
npm run export:static:ice:cms
npm run publish:dry-run:cms
```

The current audit did not run this sequence because it writes generated artifacts and current route/media blockers would make the result untrustworthy.

## Required Validation Later

After the fresh artifact is generated:

```powershell
node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out ".static-release-dry-runs/<runId>/ice-rink-rentals"
node deployment/static-azure/validate-staging-package.mjs --site ice-rink-rentals --folder ".static-release-dry-runs/<runId>/ice-rink-rentals"
```

Those validators must be updated first to expect `/service-areas` instead of the retired older Ice page folders.

## Not Performed

- No static export was run.
- No release dry run was run.
- No Azure Static Web App was created.
- No artifact was deployed.

