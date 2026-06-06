# Validator Result

Generated: 2026-06-06

## Approved Public Form Endpoint Env

Validators that require production form readiness were run with these non-secret public/readiness values:

```text
NEXT_PUBLIC_STATIC_FORM_ENDPOINT=https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
STATIC_FORM_ENDPOINT=https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
STATIC_FORM_ENDPOINT_VERIFIED=true
```

No Function setting was changed by setting these local shell variables.

## Results

| Validator | Result |
| --- | --- |
| `npm run validate:snapshot:ice` | pass, 3 pages, 5 files, 0 errors, 6 known metadata warnings |
| `npx cross-env PUMPKIN_RENDER_MODE=static SITE_KEY=ice-rink-rentals STATIC_CONTENT_SOURCE=cms-snapshot node scripts/static-publish.mjs validate` | pass, 3 pages, 0 errors, 6 known metadata warnings |
| `node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out` | pass, 42 files, 0 errors, 0 warnings |
| `node deployment/static-azure/validate-staging-package.mjs --site ice-rink-rentals --folder apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out` | pass, 42 files, 0 errors, 0 warnings |

## Known Metadata Warnings

The CMS snapshot/content validators still report the known non-blocking metadata warnings:

- contact and home `staticPublishing.needsRebuild` are true
- contact and home `fulfillment.fulfillmentStatus` are missing
- service areas `staticPublishing.needsRebuild` is true
- service areas non-direct fulfillment should set `publicDisclosureRequired` before launch

These did not block the strict static output or staging package validators.

## Guardrail Note

The strict static output validator fails without a configured public static form endpoint and `STATIC_FORM_ENDPOINT_VERIFIED=true`. The passing result above used the same approved endpoint/readiness environment used for the accepted staging package.
