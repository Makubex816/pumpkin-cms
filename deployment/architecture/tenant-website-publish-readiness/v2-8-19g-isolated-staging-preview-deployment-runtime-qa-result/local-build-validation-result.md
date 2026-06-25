# Local Build Validation Result

Result: pass.

Commands:

- `npm run validate:static:ice`
- `npm run type-check`
- `npm run build:static:ice:sanitized`

Results:

- `npm run validate:static:ice`: pass with the existing 34 warning profile for workflow/static-publishing metadata on recovered local pages.
- `npm run type-check`: pass.
- `npm run build:static:ice:sanitized`: pass.

Final sanitized build:

- Run ID: `sanitized_20260625060958`
- Static output: `apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260625060958/repo/apps/ice-rink-web/out`
- `protectedConfigCopied`: false
- `protectedConfigReferenceInOutput`: false for `static-validate`, `next-build`, and `static-generate`

Scoped source fix:

- File: `apps/ice-rink-web/src/lib/content-source.ts`
- Reason: static seed-site mode was loading older seed JSON before the V2.8.19F recovered fallback pages. The fix makes Ice seed-site static builds prefer the recovered page builders for `/`, `/service-areas`, and `/contact`.

No source integration beyond that directly necessary wiring fix was performed.
