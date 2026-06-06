# Validator Result

Generated: 2026-06-06

## Commands

Snapshot validator:

```powershell
npm run validate:snapshot:ice
```

Strict static output validator:

```powershell
node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out
```

Strict staging package validator:

```powershell
node deployment/static-azure/validate-staging-package.mjs --site ice-rink-rentals --folder apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out
```

The static validators were run with:

```text
NEXT_PUBLIC_STATIC_FORM_ENDPOINT=https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
STATIC_FORM_ENDPOINT=https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
STATIC_FORM_ENDPOINT_VERIFIED=true
```

## Results

| Validator | Result |
| --- | --- |
| snapshot validator | pass, 3 pages, 5 files, 0 errors |
| strict static output validator | pass, 42 files, 0 errors, 0 warnings |
| strict staging package validator | pass, 42 files, 0 errors, 0 warnings |
| `npm run type-check` | pass |
| `node --check apps/ice-rink-web/scripts/static-publish.mjs` | pass |

## Notes

An intermediate validator rerun without the approved form endpoint environment failed only on static form endpoint readiness. It was rerun immediately with the approved verified endpoint environment and passed.

No media errors, form endpoint errors, obsolete route errors, preview route errors, noindex errors, hidden workflow/review payload indexing warnings, or sitemap/canonical consistency issues remained after the approved rerun.
