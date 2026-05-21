# Static Release Manifest Review

Review the dry-run release folder before any Azure staging upload.

## Expected Files

For each run:

```text
.static-release-dry-runs/<runId>/static-publish-dry-run-manifest.json
.static-release-dry-runs/<runId>/STATIC_PUBLISH_DRY_RUN_SUMMARY.md
.static-release-dry-runs/<runId>/ice-rink-rentals/
.static-release-dry-runs/<runId>/roller-rink-rentals/
```

Each site folder should include:

```text
index.html
sitemap.xml
robots.txt
redirects.json
_next/static/
```

## Manifest Review

Open `static-publish-dry-run-manifest.json` and confirm:

- `runId` is current
- `contentSource` is expected, preferably `cms-snapshot` for CMS publishing
- Ice and Roller site entries exist
- `readyForManualUpload` is true for the site being staged
- file counts are nonzero
- warning counts are reviewed
- upload roots match the intended site
- no local protected config path appears

## Summary Review

Open `STATIC_PUBLISH_DRY_RUN_SUMMARY.md` and confirm:

- Ice output summary is present
- Roller output summary is present
- validator status is recorded
- secret scan status is recorded
- known warnings are understood
- no deploy action is claimed

## Redirect Review

Open each `redirects.json` and confirm:

- JSON parses
- redirects array exists
- each redirect has `from` and `to`
- type is `301`
- no loops exist
- old slugs are not in sitemap

If `redirects.json` is absent, document whether that is expected for the site.

## Sitemap And Robots Review

For each site folder:

- `sitemap.xml` exists
- sitemap `<loc>` URLs match the production canonical domain decision
- `robots.txt` exists
- robots sitemap line points to the expected canonical sitemap URL
- staging sitemaps are not submitted to search engines

## No-Secrets Review

Search release folders for:

- `.env`
- `appsettings`
- connection strings
- private keys
- JWT tokens
- Azure keys
- Cloudflare tokens
- Pumpkin tenant API keys

Use:

```powershell
node deployment/static-azure/validate-staging-package.mjs --site ice-rink-rentals --folder ".static-release-dry-runs/<runId>/ice-rink-rentals"
node deployment/static-azure/validate-staging-package.mjs --site roller-rink-rentals --folder ".static-release-dry-runs/<runId>/roller-rink-rentals"
```
