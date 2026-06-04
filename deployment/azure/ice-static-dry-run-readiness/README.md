# Ice Static Dry Run Readiness

Generated: 2026-06-04

This package records safe local static dry-run/readiness proof work for IceSkatingRinkRentals.com.

No Azure resources, Cosmos resources, Blob containers, Cloudflare DNS records, CMS records, Theme records, MediaAsset records, Microsoft 365 settings, email, static deployment, protected config access, or Roller work occurred.

## Result

The safe Ice-only command remains:

```powershell
cd apps/ice-rink-web
npm run export:static:ice:cms
```

Current result: exit `1`, stopped during `snapshot:cms:ice`.

What improved:

- required env vars were present
- admin JWT env and temp-file sources were present by status only
- theme read no longer returns 401
- `themeSnapshot: true`
- CMS discovery still sees six pages, but local Ice snapshot output is filtered to the approved three slugs

Current blocker:

- local `/media/...` URLs remain
- `home` and `service-areas` still have `noindex`
- static form endpoint is missing/unverified
- fetched theme navigation still references obsolete routes and misses `/`

## Classification

| Gate | Status |
| --- | --- |
| static dry run completed | no |
| static route output ready | no |
| media production URL readiness | no |
| contact form production readiness | no |
| Azure staging readiness | no |
| DNS cutover readiness | no |
| production/indexing readiness | no |

## Files

- `STATIC_DRY_RUN_COMMAND.md`
- `ROUTE_OUTPUT_AUDIT.md`
- `SITEMAP_ROBOTS_AUDIT.md`
- `MEDIA_URL_AUDIT.md`
- `CONTACT_FORM_ENDPOINT_AUDIT.md`
- `PREVIEW_ROUTE_EXCLUSION_AUDIT.md`
- `OBSOLETE_ROUTE_EXCLUSION_AUDIT.md`
- `DRY_RUN_RESULT.md`
- `REMAINING_BLOCKERS.md`
- `NEXT_AZURE_SETUP_STEPS.md`
- `manifest.json`
