# Validation Matrix

Generated: 2026-06-04

## Matrix

| Phase | Route validator | Snapshot validator | Media URL validator | Form endpoint validator | Noindex/indexing validator | Sitemap/robots validator | Obsolete route validator | Secret scan | Generated artifact scan |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| current local route proof | pass | pass | fail expected | fail expected | noindex cleared | pass/known output | pass | pass | pass |
| current strict validators | pass route shape | pass | fail 6 local media file errors | fail 2 endpoint errors | pass noindex gate | pass route proof | pass | pass | pass |
| after media setup | expected pass | expected pass | expected pass | still fail until form ready | expected pass | expected pass | expected pass | required | required |
| after form endpoint setup | expected pass | expected pass | expected pass if media ready | expected pass after verified endpoint | expected pass | expected pass | expected pass | required | required |
| before Azure staging | must pass or have approved staging exception | must pass | must pass or approved exception | must pass or approved exception | must pass | must pass | must pass | required | required |
| after Azure staging | validate staged URLs | validate package provenance | verify media loads | verify endpoint behavior | verify canonical/noindex behavior | verify sitemap/robots | verify no obsolete paths | required | ensure artifacts not staged |
| before DNS cutover | staging pass required | release package validated | production media ready | endpoint verified | production indexing approved | sitemap/robots final | obsolete routes absent | required | generated artifacts not committed |
| after production cutover | live route smoke pass | release provenance retained | live media loads | form test only if approved | live indexing final | live sitemap/robots pass | obsolete routes absent | required | no generated artifacts staged |

## Key Validators

Current known commands:

```powershell
cd apps/ice-rink-web
npm run validate:snapshot:ice
```

```powershell
node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out apps/ice-rink-web/out
node deployment/static-azure/validate-staging-package.mjs --site ice-rink-rentals --folder apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out
```

## Current Expected Result

Strict validators remain `fail expected` until production media and verified static form endpoint gates are approved and completed.

