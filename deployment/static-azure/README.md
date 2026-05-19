# Static Azure Deployment Readiness

This folder documents the Option C static-first deployment path for the Pumpkin CMS rental-site engine.

Phase 5C does not deploy anything. It prepares the repeatable shape for building static site artifacts, validating them, and later handing them to Azure and Cloudflare.

## Option C Overview

Option C means public sites are served as static files generated from controlled CMS/Page JSON content.

The intended flow is:

1. edit and approve content in Pumpkin CMS
2. export or stage validated Page JSON
3. build one static output per tenant/site
4. validate the output artifact
5. deploy to Azure static hosting
6. purge Cloudflare only after a successful upload

Public requests should not need to call Pumpkin API for every page view. Pumpkin becomes the content control and publishing engine.

## Prerequisites

- Node.js and npm installed.
- `apps/ice-rink-web` dependencies installed with `npm install`.
- Static content available under `tools/ice-rink-local-seed/seed-sites/{SITE_KEY}`.
- No production credentials in repo files.
- Azure and Cloudflare credentials stored only as GitHub/Azure secrets when deployment automation is added.

## Build Ice Static Output

From `apps/ice-rink-web`:

```powershell
npm run export:static:ice
```

This validates and builds:

- `SITE_KEY=ice-rink-rentals`
- domain: `iceskatingrinkrentals.com`

The generated site snapshot is copied to:

```text
apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out
```

## Build Roller Static Output

From `apps/ice-rink-web`:

```powershell
npm run export:static:roller
```

This validates and builds:

- `SITE_KEY=roller-rink-rentals`
- domain: `rollerrinkrentals.com`

The generated site snapshot is copied to:

```text
apps/ice-rink-web/.static-artifacts/roller-rink-rentals/out
```

## Validate Static Output

From the repo root:

```powershell
node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out
node deployment/static-azure/validate-static-output.mjs --site roller-rink-rentals --out apps/ice-rink-web/.static-artifacts/roller-rink-rentals/out
```

The validator checks required files, expected routes, sitemap/robots, canonical domains, static assets, missing env/config leaks, and obvious sensitive-value patterns.

## Production Publish Dry Run

Phase 5E adds a local dry run that builds, validates, and packages both public sites without deploying anything.

From `apps/ice-rink-web`:

```powershell
npm run publish:dry-run
```

Equivalent repo-root command:

```powershell
node deployment/static-azure/scripts/static-publish-dry-run.mjs
```

The dry run:

- runs `npm run export:static:ice`
- runs `npm run export:static:roller`
- validates both generated outputs
- copies upload-ready site folders into a timestamped ignored release folder
- validates the copied release folders
- scans for forbidden env/config files and high-confidence secret-looking values
- writes a machine-readable manifest
- writes a human-readable summary

Generated dry-run artifacts are created under:

```text
.static-release-dry-runs/YYYY-MM-DD-HHMM/
```

Per-site upload roots:

```text
.static-release-dry-runs/YYYY-MM-DD-HHMM/ice-rink-rentals/
.static-release-dry-runs/YYYY-MM-DD-HHMM/roller-rink-rentals/
```

Generated metadata:

```text
.static-release-dry-runs/YYYY-MM-DD-HHMM/static-publish-dry-run-manifest.json
.static-release-dry-runs/YYYY-MM-DD-HHMM/STATIC_PUBLISH_DRY_RUN_SUMMARY.md
```

The dry-run folder is ignored by git and should not be committed.

The dry run does not:

- deploy to Azure
- modify Cloudflare
- use production credentials
- create active GitHub Actions workflows

Before any real deployment, inspect the manifest and summary, then follow `static-release-checklist.md`.

## CMS To Static Publish Bridge

Phase 5H adds a local bridge from Pumpkin CMS content to static publishing artifacts.

Default static export still uses seed-sites. CMS snapshot mode is opt-in:

```powershell
cd apps/ice-rink-web
npm run snapshot:cms:ice
npm run validate:snapshot:ice
npm run export:static:ice:cms
npm run publish:dry-run:cms
```

Roller uses the matching `:roller` scripts.

CMS snapshot artifacts are generated under:

```text
apps/ice-rink-web/.static-content-snapshots/{SITE_KEY}/
```

That folder is ignored by git. It is a generated publish artifact, not source code.

Source-of-truth guidance:

- Cosmos/Pumpkin API is the editable CMS store.
- CMS snapshots are generated JSON publish artifacts.
- Static output is the deployable public site.
- Seed-sites remain developer/bootstrap content and the default static source.

See `cms-to-static-publish-bridge.md` for the full workflow and safety rules.

## GitHub Actions Examples

Copy/paste-ready workflow templates live outside `.github/workflows` so they cannot run accidentally:

```text
deployment/static-azure/github-actions-examples/static-export-ice.yml.example
deployment/static-azure/github-actions-examples/static-export-roller.yml.example
```

To activate one later, copy the relevant `.yml.example` file into `.github/workflows/*.yml`, review the hosting target, and configure the referenced GitHub environment secrets in repository settings.

## Azure Static Web Apps Path

Azure Static Web Apps is the simplest first hosting option:

- upload the dry-run site folder for the matching tenant/domain
- attach a custom domain
- use the managed global edge and TLS support
- keep deployment credentials in GitHub secrets

Suggested first production resources:

- `swa-ice-rink-rentals-prod`
- `swa-roller-rink-rentals-prod`

Use one Static Web App per public domain for clean isolation and rollback.

## Azure Storage Static Website Path

Azure Storage static website hosting is also viable:

- upload files to the `$web` container
- configure index and 404 documents
- optionally place Azure CDN, Front Door, or Cloudflare in front

Important HTTPS note:

- Storage static website endpoints can host static files.
- Custom-domain HTTPS typically needs Azure CDN/Front Door or Cloudflare/public HTTPS strategy in front of it.

For a dry-run package, upload the contents of the matching per-site folder into the matching `$web` container during a future real deployment.

## Cloudflare DNS And Cache Notes

Cloudflare should sit in front for DNS/CDN/WAF after the Azure target is chosen.

Conceptual guidance:

- proxy public domains with orange-cloud records when Cloudflare should cache/protect traffic
- cache `/_next/static/*` and other immutable assets aggressively
- keep HTML cache conservative until purge automation exists
- bypass `/api/*`, `/admin/*`, `/login*`, and dynamic form endpoints
- purge only after a successful Azure upload

See `cloudflare-cache-rules.md` for more detail.

## Static Form Limitation

Static exports do not include Next.js API routes. The current runtime `/api/contact` route works only in runtime CMS mode.

Static public forms can post to `NEXT_PUBLIC_STATIC_FORM_ENDPOINT` when that endpoint is configured at static build time. If no endpoint is configured, the static form shows an inline error and does not pretend success.

Static public forms need one of:

- Azure Function
- standalone Pumpkin API endpoint designed for public form intake
- trusted third-party form endpoint
- CRM-native endpoint

Recommended first route shape:

```text
https://<function-app>.azurewebsites.net/api/static-contact
```

See `static-form-strategy.md` and `forms/README.md`.

## No-Secrets Policy

Do not commit:

- Azure tokens
- Cloudflare tokens
- storage connection strings
- API keys
- JWT/signing values
- `.env.local`
- `appsettings.Development.json`

Example workflow templates in this repo live under `deployment/static-azure/github-actions-examples/` and use placeholder GitHub secret names only.

## Rollback Strategy

Recommended rollback model:

1. keep every validated static artifact tied to a commit SHA and site key
2. deploy immutable artifacts, not ad hoc local folders
3. retain the last known good artifact for each domain
4. rollback by redeploying the previous artifact
5. purge Cloudflare after rollback upload succeeds
6. record deploy and rollback events in a future Pumpkin publishing log

For Azure Static Web Apps, also use environments or deployment history where available. For Storage, keep versioned artifact archives before overwriting `$web`.
