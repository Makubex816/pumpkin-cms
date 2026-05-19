# Azure Storage Static Website Runbook

This runbook is a planning document for the Storage static website alternative. It does not contain credentials and does not perform deployment.

## Placeholder Resource Names

Suggested storage account names:

- `sticerinkrentalsprod`
- `strollerrinkrentalsprod`

Exact storage account names must be globally unique and comply with Azure naming rules.

## Before Creating Resources

Confirm:

- Timothy has chosen Storage static website hosting.
- Cloudflare or another HTTPS fronting strategy is approved.
- `npm run publish:dry-run` passes.
- The dry-run manifest and summary have been reviewed.
- Rollback artifact retention is planned.

## Create Storage Account For Ice

1. Open Azure Portal.
2. Create a new Storage Account.
3. Use placeholder name `sticerinkrentalsprod`.
4. Choose resource group, region, redundancy, and access settings.
5. Enable static website hosting.
6. Set index document to `index.html`.
7. Set error document to `404.html`.
8. Record the static website endpoint in a private deployment note.

## Upload Ice Dry-Run Output

Use the contents of:

```text
.static-release-dry-runs/<run-id>/ice-rink-rentals/
```

Future upload target:

```text
$web
```

Do not upload from an unvalidated local folder.

## Create Storage Account For Roller

1. Create a second Storage Account.
2. Use placeholder name `strollerrinkrentalsprod`.
3. Enable static website hosting.
4. Set index document to `index.html`.
5. Set error document to `404.html`.
6. Record the static website endpoint in a private deployment note.

## Upload Roller Dry-Run Output

Use the contents of:

```text
.static-release-dry-runs/<run-id>/roller-rink-rentals/
```

Future upload target:

```text
$web
```

## Cloudflare In Front

Cloudflare is recommended for the public edge if Storage static website hosting is selected.

Use Cloudflare to provide:

- DNS
- HTTPS termination
- CDN/cache rules
- WAF rules
- future purge workflow

## HTTPS Warning

Raw Azure Storage static website hosting is simple for static files, but custom-domain HTTPS requires extra planning.

For production public domains, use one of:

- Cloudflare in front
- Azure CDN
- Azure Front Door

Avoid a production launch where custom-domain HTTPS is unclear.

## Cache Notes

Cache aggressively:

- `/_next/static/*`
- immutable CSS/JS/font/image assets

Cache conservatively until purge automation exists:

- `/`
- HTML page routes
- `/sitemap.xml`
- `/robots.txt`

Bypass cache:

- static form endpoint
- admin/API/login endpoints
- any dynamic webhook or CRM endpoint

## Rollback Notes

Before overwrite:

- keep previous dry-run artifact
- record current `$web` state if possible
- record commit SHA and run ID

Rollback:

1. re-upload previous known-good artifact to `$web`
2. verify key routes at the origin
3. purge Cloudflare
4. verify key routes through Cloudflare

## No-Secrets Warning

Never commit:

- Azure Storage connection strings
- SAS tokens
- account keys
- Cloudflare API tokens
- `.env.local`
- `appsettings.Development.json`
