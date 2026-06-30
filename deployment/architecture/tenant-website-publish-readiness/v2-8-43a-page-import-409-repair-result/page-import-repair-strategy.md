# Page Import Repair Strategy

Strategy: scoped source repair plus corrected payload strategy.

Implemented repair:

- Add `targetSlug` to `PageImportRequest`.
- Resolve import target slug from `targetSlug` when present, otherwise from the exported page slug.
- Preserve the exported source page ID before target mutation for provenance.
- Generate a fresh `page-import-{guid}` document ID for create imports.
- Use `ImportRunSanitizer.PrepareForSave(...)` before `SaveImportRunAsync(...)`.

Corrected proof strategy:

- Use safe slugs that survive source and import normalization.
- Create one source page.
- Export once.
- Import once to a distinct target slug.
- Clean up source and imported pages independently.
