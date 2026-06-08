# Rollback And Abort Plan

## Phase 2C-4 Rollback

No rollback is needed for Phase 2C-4 because it performs no mutations.

## Abort Before Future Write

Abort before any future CMS write if:

- approval text is missing or ambiguous
- package path is not the validated Roller package
- validation does not pass
- a secret appears
- protected config or protected paths appear
- rollback owner is missing
- owner/content/media/form/legal/privacy responsibilities are unclear
- live-page publication is requested
- Search Console or indexing is requested
- Azure, Cloudflare, DNS, deployment, email, Microsoft 365, Function App settings, or external checks are requested

## Future CMS Import Rollback Planning

If a future CMS import is approved and fails after writing records:

1. Stop further writes.
2. Capture exact created/updated CMS IDs.
3. Preserve redacted evidence.
4. Do not touch external systems.
5. Request explicit rollback approval.
6. Roll back the smallest CMS draft/preview scope needed.
7. Delete or disable only records created by the approved Roller import, if rollback approval allows it.
8. Preserve unrelated tenants, email, media, DNS, deployment, Search Console, and live pages.

## External Rollback

No external rollback should be needed for the future CMS import gate because external systems remain excluded.

## Live Pages

Live pages remain hard-stopped before, during, and after any future CMS import planning or execution.
