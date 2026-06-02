# .NET / TypeScript Alignment

.NET model alignment:
- `apps/pumpkin-net-models/Models/Page.cs` now carries MediaAsset-backed page media and domain routing metadata.
- Typed block models now preserve production section metadata with explicit `sectionVariant` fields and extension-data dictionaries.
- `tools/dotnet-page-contract/Program.cs` now reports `ProductionFieldPersistenceOk` for each page summary.

TypeScript model alignment:
- `packages/pumpkin-ts-models/src/models/Page.ts` now includes the same MediaAsset, media slot, Open Graph image, and domain routing metadata.
- `packages/pumpkin-ts-models/src/models/IHtmlBlock.ts` now permits block-level extension fields.

Admin helper alignment:
- `apps/admin/src/app/dashboard/pages/[id]/edit/page.tsx` preserves Open Graph media metadata and domain routing extras.
- `apps/admin/src/app/dashboard/pages/import-export/page.tsx` default media/domain routing shapes include the repaired fields.
- `apps/admin/src/lib/page-repairs.ts` no longer collapses Open Graph media to only `url` and `alt`.

Why this matters:
- The production Ice homepage renderer selects layouts by `content.sectionVariant`.
- Media-backed homepage sections require tenant-safe MediaAsset IDs and official metadata.
- The selected mailbox is policy metadata only and must persist without exposing credentials or enabling real email sending.

