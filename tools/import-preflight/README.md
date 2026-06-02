# Pumpkin Import Preflight CLI

`tools/import-preflight/import-preflight.mjs` is a local, non-mutating import preflight runner for Page JSON.

It is designed for cases where the admin Import/Export UI preflight cannot be run without an authenticated admin session, but a candidate still needs an auth-free local review gate before any future CMS write is authorized.

## Safety Rules

The tool:

- reads a local JSON candidate only
- optionally writes a local JSON report
- runs the .NET Page contract tool when available, using the existing build output so a running local API does not force a rebuild
- performs local shape, design, media, form, route, canonical, placeholder, business-value, and unsafe-content checks
- does not require admin JWTs or API keys
- does not call live write APIs
- does not mutate Cosmos/CMS data
- does not read protected config
- does not send email
- does not create or update MediaAsset records

## Command

```powershell
node tools/import-preflight/import-preflight.mjs `
  --input content-review/ice-homepage-media-upload-selection/proposed-homepage.media-selected-candidate.json `
  --tenant-id ice-rink-rentals `
  --site-key ice-rink-rentals `
  --route / `
  --mode preflight-only `
  --output content-review/ice-homepage-import-preflight/homepage-import-preflight-result.json
```

## Classification

The tool reports:

- `preflight-valid-for-shape`
- `preflight-valid-for-local-draft-import`
- `preflight-valid-for-CMS-import`
- `preflight-valid-for-production`

Shape validity means the candidate parses, deserializes through the .NET Page/block gate, preserves route/canonical expectations, and has no unsafe HTML/CSS/form/media/email patterns.

CMS import and production validity are stricter and include MediaAsset bindings, business values, human approval, static publishing state, and production policy readiness.

## Differences From Admin/API Preflight

This local CLI mirrors the admin/API validation categories where practical, but it does not fetch tenant pages, compare against the current CMS page list, create revision snapshots, save ImportRun history, or execute API write-path persistence. Those require authenticated admin/API context.
