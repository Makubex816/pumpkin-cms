# Post-Execution Validation Plan

Generated: 2026-06-04

## Scope

Future validation plan only. No export, deployment, upload, or production validator was run in this preparation pass.

## Future Validation Sequence

After approved media resources, upload, Cloudflare media hostname, and MediaAsset updates:

1. Verify all 9 CDN URLs return `200`.
2. Verify CDN response headers include correct `Content-Type` and cache policy.
3. Rerun Ice static export.
4. Rerun `npm run validate:snapshot:ice`.
5. Rerun strict static output validator.
6. Rerun strict staging package validator.
7. Confirm the 6 local media file-level errors are cleared.
8. Confirm approved routes remain exactly `/`, `/contact`, `/service-areas`.
9. Confirm preview and obsolete deployable paths remain absent.
10. Confirm no unapproved external, base64, localhost, placeholder, or local media URLs appear.
11. Confirm contact form production readiness remains `no` until the form endpoint gate is handled.

## Expected Validator Commands

Future examples:

```powershell
cd apps/ice-rink-web
npm run export:static:ice:cms
npm run validate:snapshot:ice
```

From the repo root:

```powershell
node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out apps/ice-rink-web/out
node deployment/static-azure/validate-staging-package.mjs --site ice-rink-rentals --folder apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out
```

Stop point: generated output and static artifacts must not be staged.

## Pass Criteria

- media production URL validator passes
- route proof remains clean
- snapshot validator passes
- no local body/media URL errors remain
- form endpoint errors remain classified separately until form endpoint setup is approved
- static output quality gates do not become fully ready until form blockers are also resolved

## Current Run Result

Validation plan documented only. Media production URL readiness remains `no`.
