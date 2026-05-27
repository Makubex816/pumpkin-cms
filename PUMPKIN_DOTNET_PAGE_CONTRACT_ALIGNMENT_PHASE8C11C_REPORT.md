# Pumpkin CMS Phase 8C.11C Report

## Phase

Phase 8C.11C: .NET Page Contract Generation Alignment

## Scope

Primary launch focus: IceSkatingRinkRentals.com.

RollerRinkRentals.com remains paused.

No CMS import, live CMS Page update, live CMS Theme update, static regeneration, Azure deployment, Cloudflare/DNS change, workflow creation, or protected config change was performed.

## Git Status At Start

Starting state was clean:

```text
git status --short
<no output>
```

Latest commit at start:

```text
337abbe Add Phase 8C.11B Tailwind and navigation hardening
```

Phase 8C.11 and Phase 8C.11B were already committed. The Phase 8C.11-QA report existed in the repo at start.

## Files Changed

- `apps/pumpkin-net-models/Models/HtmlBlockFactory.cs`
- `apps/pumpkin-api/Services/DesignSystemGuard.cs`
- `tools/dotnet-page-contract/Pumpkin.PageContractTool.csproj`
- `tools/dotnet-page-contract/Program.cs`
- `tools/dotnet-page-contract/README.md`
- `tools/dotnet-page-contract/STATE_CITY_GENERATION_CONTRACT.md`
- `tools/dotnet-page-contract/validate-contract-alignment.mjs`
- `content-review/ice-launch-phase8c10-import-candidate/README.md`
- `content-review/ice-launch-phase8c10-import-candidate/IMPORT_CANDIDATE_CHECKLIST.md`
- `content-review/ice-launch-phase8c10-import-candidate/ice-homepage.import-candidate.json`
- `content-review/ice-launch-phase8c10-import-candidate/ice-contact.import-candidate.json`
- `content-review/ice-launch-phase8c10-import-candidate/ice-service-areas.import-candidate.json`
- `content-review/ice-launch-phase8c10-import-candidate/ice-launch-import-candidate-package.json`
- `PUMPKIN_DOTNET_PAGE_CONTRACT_ALIGNMENT_PHASE8C11C_REPORT.md`

## Current Page/Block Generation Assessment

The repo already had .NET `Page`, `HtmlBlockBase`, known block classes, form definitions, media models, design-system models, TypeScript page/block/form/media/design models, admin editor handling, public renderer handling, package block views, import/export metadata, and static validators.

Gap found: .NET `HtmlBlockFactory` selected the correct block class, but known block `content` was still materialized as generic JSON because the override property is typed as `object`.

Repair: `HtmlBlockFactory` now hydrates known block content into matching .NET content classes through a `ContentTypeMap`.

## .NET Canonical Contract Tool

Added `tools/dotnet-page-contract/`.

The tool supports:

```powershell
dotnet run --project tools\dotnet-page-contract\Pumpkin.PageContractTool.csproj -- validate-package --path content-review\ice-launch-phase8c10-import-candidate
dotnet run --project tools\dotnet-page-contract\Pumpkin.PageContractTool.csproj -- validate-page --path <page-json>
node tools\dotnet-page-contract\validate-contract-alignment.mjs
```

It validates CMS-bound JSON by:

- loading package/page JSON from disk
- deserializing pages into .NET `Page`
- deserializing known blocks through .NET `HtmlBlockFactory`
- hydrating known block content classes
- running `DesignSystemGuard`
- validating inline/default form definitions as .NET `FormDefinition`
- validating theme design-system recommendations as .NET `ThemeDesignSystem`
- performing `.NET Page -> JSON -> .NET Page` round-trip proof
- reporting warnings/errors
- exiting non-zero on blocking errors

## Import-Candidate Validation Result

Command run:

```powershell
dotnet run --project tools\dotnet-page-contract\Pumpkin.PageContractTool.csproj -- validate-package --path content-review\ice-launch-phase8c10-import-candidate
```

Result: passed with zero blocking errors.

Decision from tool:

```text
dotnet-contract-valid-not-cms-import-ready
```

Validated pages:

- Homepage: 10 blocks, round-trip passed.
- Contact: 6 blocks including visible `formBlock`, round-trip passed.
- Service Areas: 8 blocks, round-trip passed.

Validated form definitions:

- `default-contact`
- `default-quote-request`

Expected warnings remain:

- unresolved media requirements
- review/import-candidate root metadata not part of canonical .NET `Page`
- theme navigation warning because this package records design-system recommendation metadata, while launch navigation remains the source/fallback nav contract from Phase 8C.11B

## Round-Trip Proof

Round-trip proof passed for all three Ice import-candidate pages:

```text
JSON -> .NET Page/block classes -> canonical JSON -> .NET Page/block classes
```

Semantic equivalence checked:

- `PageId`
- `TenantId`
- `PageSlug`
- block count
- block type sequence

## TS/.NET Alignment Result

Command run:

```powershell
node tools\dotnet-page-contract\validate-contract-alignment.mjs
```

Result: passed.

Verified aligned block type set:

```text
Hero, PrimaryCTA, SecondaryCTA, CardGrid, FAQ, Breadcrumbs, TrustBar,
HowItWorks, ServiceAreaMap, LocalProTips, Gallery, Testimonials, Contact,
formBlock, Blog, customHtml, trustedEmbed
```

The script verifies alignment across:

- .NET `BlockTypeMap`
- .NET `ContentTypeMap`
- TypeScript `BLOCK_TYPE_MAP`
- `packages/pumpkin-block-views` renderer view coverage

## Block Types Verified

- `customHtml`
- `trustedEmbed`
- `formBlock`
- `Hero`
- `PrimaryCTA`
- `SecondaryCTA`
- `CardGrid`
- `FAQ`
- `Breadcrumbs`
- `TrustBar`
- `HowItWorks`
- `ServiceAreaMap`
- `LocalProTips`
- `Gallery`
- `Testimonials`
- `Contact`
- `Blog`

## Mismatches Found And Repaired

Found:

- Ice import-candidate `linking.relatedPages`, `linking.requiredLinks`, and `linking.breadcrumbTrail` used object entries, while .NET `PageLinking` expects string arrays.
- Known block classes were selected by .NET, but known block content was not hydrated into the matching content classes.

Repaired:

- Ice import-candidate linking arrays were normalized to route strings.
- `HtmlBlockFactory` now hydrates known content classes.
- `DesignSystemGuard` now blocks unsupported content block types instead of allowing unknown production-bound block types to pass silently.

## Import/Export/Preflight Alignment

Phase 8C.11C hardwires this gate:

- review-only JSON may be human-edited
- import-candidate JSON must pass .NET contract validation
- CMS-ready JSON must pass .NET validation, TypeScript/design validation, media validation, form validation, human approval, and admin import/export preflight
- production-bound JSON must also pass static and staging validators

The Phase 8C.10 import-candidate checklist and package manifest now include the .NET contract commands. API page write paths already run `DesignSystemGuard`; this phase strengthened that guard for unknown block types.

## Future State-City Generation Architecture

No city/location page was created.

Future location pages must use:

```text
/state-city
```

Examples:

```text
/fl-orlando
/ny-new-york
/pa-philadelphia
```

Rules are documented in `tools/dotnet-page-contract/STATE_CITY_GENERATION_CONTRACT.md`:

- state first, city second
- lowercase
- hyphen-separated
- no nested `/city/`, `/locations/`, or `/service-areas/` city route unless explicitly changed later
- generated pages must use .NET `Page` and block classes or pass through this .NET contract gate
- future 250+ page generation must fail if it bypasses .NET contract validation

## Review-Only vs CMS-Ready

- Review-only: may contain human review metadata and unresolved business/media notes.
- Import-candidate: must pass .NET contract validation before CMS preflight.
- CMS-ready: must pass .NET contract validation, TS/design/media/form validation, human approvals, and admin import/export preflight.
- Production-bound: must pass static validators, staging validators, and launch governance.

## Checks Run

- `dotnet build tools\dotnet-page-contract\Pumpkin.PageContractTool.csproj` passed.
- `dotnet build apps\pumpkin-api\pumpkin-api.csproj` passed.
- `.NET page contract validation` against the Ice import-candidate package passed.
- `.NET serialization/deserialization round-trip` passed for the three Ice pages.
- `node tools\dotnet-page-contract\validate-contract-alignment.mjs` passed.
- `node --check tools\dotnet-page-contract\validate-contract-alignment.mjs` passed.
- JSON parse validation for Phase 8C.10 bundle JSON passed.
- `node tools\design-system-validation\validate-fixtures.mjs` passed, 28/28.
- `node tools\default-form-validation\validate-default-form-fixtures.mjs` passed, 21/21.
- `node tools\media-validation\validate-media-fixtures.mjs` passed with existing media warnings.
- `node tools\design-system-validation\validate-tailwind-navigation-fixtures.mjs` passed.
- `npm run build` in `packages/pumpkin-block-views` passed.
- `npm run type-check` in `apps/admin` passed.
- `npm run type-check` in `apps/ice-rink-web` passed.
- `git diff --check` passed.
- Direct trailing whitespace scan passed.
- Protected config/workflow/generated-folder check passed.
- Targeted secret scan passed.
- No generated static folders were staged.
- No ZIPs were changed or staged.

## Known Limitations

- `npm run build` in `packages/pumpkin-ts-models` could not run directly because local `tsc` is not installed in that package folder. A borrowed compiler run then surfaced pre-existing `require`/Node type-definition errors in `PageJsonConverter.ts`; no TypeScript model files were changed in this phase.
- The Ice import-candidate package still has unresolved media and business-value blockers.
- Admin import/export preflight has not been run against an approved CMS import package.
- Human approval is still missing.
- No production static regeneration was run in this phase.

## Readiness Decision

Current Ice import-candidate package is .NET-contract-valid: yes.

Current Ice import-candidate package is CMS-import-ready: no.

Current Ice import-candidate package is production/indexing-ready: no.

Remaining CMS import blockers:

- final MediaAsset selections/uploads
- approved business values
- human content/design/SEO/form approvals
- admin import/export preflight

## Next Recommended Phase

Resolve approved Ice business values and final media selections, then build a CMS import preflight package that runs through this .NET contract gate before any CMS write.
