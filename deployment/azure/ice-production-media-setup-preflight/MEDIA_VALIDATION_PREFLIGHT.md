# Media Validation Preflight

Generated: 2026-06-04

## Scope

This is the validation plan for after approved media setup. No static export or production media validator was rerun in this preflight.

## Required Future Validation Sequence

After approved media upload and MediaAsset update:

1. Re-read all 9 MediaAsset records.
2. Confirm all target CDN URLs load over HTTPS.
3. Confirm content type and cache headers.
4. Rerun Ice static export.
5. Rerun snapshot validator.
6. Rerun strict static output validator.
7. Rerun strict staging package validator.
8. Confirm approved routes remain exactly `/`, `/contact`, `/service-areas`.
9. Confirm the 6 media file-level errors are cleared.
10. Confirm no new unapproved external, base64, localhost, placeholder, or local media URLs appear.

## Expected Commands For Later

Run only after explicit approval for the relevant execution stage:

```powershell
npm run validate:snapshot:ice
```

Future static export and strict validators should follow the existing Ice static dry-run workflow and static Azure validator commands documented in the readiness packages.

## Media-Specific Checks

The future strict validation pass should prove:

- no `/media/ice-rink-rentals/...` URLs remain in production-bound static output
- no `localhost` URLs remain
- no `example.com` or placeholder media host remains
- no base64 image payload is introduced
- every required media URL uses `https://media.iceskatingrinkrentals.com`
- all approved page imagery remains visible in rendered output

## Route Checks

Approved routes must remain exactly:

- `/`
- `/contact`
- `/service-areas`

Preview, obsolete, and unrelated deployable paths must remain absent.

## Readiness Rule

Media production URL readiness can be marked `yes` only after:

- CDN URLs are live
- MediaAsset records are updated and read back
- static output uses only approved CDN media URLs
- strict media validators pass
- no route proof regression occurs

## Current Run Result

Validation plan documented only. Media production URL readiness remains `no`.
