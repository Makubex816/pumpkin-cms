# Cleanup Scope

## Approved

- diagnose why exported static files still serialized `revision.latestSnapshot` rollback payloads with stale local `/media/...` URLs
- repair public static export serialization so admin rollback payload data does not fail production media validators
- prefer omission of admin rollback payloads from public static artifacts
- rerun Ice static export and validators
- update reports/docs

## Not Approved Or Performed

- CMS writes
- active page/body edits
- stale CMS revision edits
- MediaAsset writes
- theme or navigation edits
- form endpoint deployment or configuration
- Cloudflare changes
- Azure changes
- static deployment or production deployment
- DNS changes
- email or Microsoft 365 work
- protected config reads
- secret/JWT/API key printing
- raw image staging
- Roller work

## Route Boundary

Approved public Ice page routes remain:

```text
/
/contact
/service-areas
```

Preview routes and obsolete slugs remain excluded:

```text
/ice-rink-rentals
/events-holiday-activations
phase-5a-csv-import-54754949
```

