# Pumpkin Ice Homepage Import Preflight Report

Date: June 2, 2026

## Scope

Build a safe local import preflight runner for the IceSkatingRinkRentals.com homepage candidate without protected config, admin JWTs, or CMS writes.

RollerRinkRentals.com remains paused.

## Start State

`git status --short` at task start was clean.

Recent git log reviewed:

```text
c6e6382 Add Ice homepage local CMS preview readiness report
0b7345f Add Ice local preview readiness package
2ecd323 Update Microsoft 365 operational verification docs
9f31719 Record confirmed Microsoft 365 mailbox verification
10393b7 Add Microsoft 365 operational email verification package
5f86906 Add Microsoft 365 email provider selection readiness
218f4ca Select Microsoft 365 Exchange Online for Ice email readiness
3792044 Update Ice homepage media upload selection manifest
910971c Add email infrastructure readiness system
3526250 Add Ice import readiness input request package
bbf848f Add Ice homepage media upload selection manifest
52d4c9c Add Phase 8C.14B page intake normalizer
```

## Reviewed Context

- `PUMPKIN_ICE_HOMEPAGE_LOCAL_CMS_PREVIEW_REPORT.md`
- `content-review/ice-homepage-local-cms-preview/manifest.json`
- `content-review/ice-homepage-media-upload-selection/proposed-homepage.media-selected-candidate.json`
- `apps/admin/src/lib/content-json-contracts.ts`
- `apps/admin/src/lib/import-diff.ts`
- `apps/admin/src/app/dashboard/pages/import-export/page.tsx`
- `apps/pumpkin-api/Managers/PumpkinManager.cs`
- `apps/pumpkin-api/Services/DesignSystemGuard.cs`
- `apps/pumpkin-api/Services/PageRedirectGuard.cs`
- `apps/pumpkin-api/Services/MediaAssetSanitizer.cs`
- `tools/dotnet-page-contract/README.md`
- existing media, design-system, default-form, Tailwind/navigation, and page-intake normalizer tooling

Protected config was not read or modified.

## Files Changed

- `tools/import-preflight/README.md`
- `tools/import-preflight/import-preflight.mjs`
- `tools/page-intake-normalizer/normalize-page-intake.mjs`
- `content-review/ice-homepage-import-preflight/README.md`
- `content-review/ice-homepage-import-preflight/HOMEPAGE_IMPORT_PREFLIGHT_RESULT.md`
- `content-review/ice-homepage-import-preflight/HOMEPAGE_IMPORT_PREFLIGHT_BLOCKERS.md`
- `content-review/ice-homepage-import-preflight/HOMEPAGE_DRAFT_IMPORT_DECISION.md`
- `content-review/ice-homepage-import-preflight/homepage-import-preflight-result.json`
- `content-review/ice-homepage-import-preflight/manifest.json`
- `PUMPKIN_ICE_HOMEPAGE_IMPORT_PREFLIGHT_REPORT.md`

## Tool Added

`tools/import-preflight/import-preflight.mjs` is a local, preflight-only Page JSON validator.

It:

- parses the candidate JSON
- rejects protected paths and raw media inputs
- scans for high-confidence secrets
- validates tenant/site/route/canonical expectations
- checks required homepage blocks and known block types
- checks rich custom HTML/form safety
- checks focused homepage media/form fields
- classifies business, approval, MediaAsset, static, and production blockers
- runs the .NET Page/block contract tool with `--no-build` so a running local API does not force a rebuild
- writes a JSON result when `--output` is provided

It does not require admin JWTs, API keys, tenant API keys, or protected config.

`tools/page-intake-normalizer/normalize-page-intake.mjs` was also adjusted to run the .NET contract tool with `--no-build`, matching the local-stack-safe behavior above.

## Difference From Admin/API Preflight

This local preflight mirrors admin/API validation categories where practical, but it does not:

- fetch current CMS pages
- prove create/update collision behavior
- create revision snapshots
- create ImportRun history
- call `SavePageAsync` or `UpdatePageAsync`
- prove database persistence

Those steps remain authenticated admin/API responsibilities.

## Source Candidate

- Path: `content-review/ice-homepage-media-upload-selection/proposed-homepage.media-selected-candidate.json`
- tenantId: `ice-rink-rentals`
- siteKey: `ice-rink-rentals`
- pageSlug: `home`
- route: `/`
- canonical: `https://iceskatingrinkrentals.com/`
- blocks: 10
- form key: `default-quote-request`
- unresolved media requirements: 6

## Preflight Result

The candidate passed:

- JSON parse validation
- tenant/site guard
- slug/route/canonical audit
- required homepage block checks
- known block type checks
- rich block safety checks
- default form reference guard
- unsafe HTML/CSS/form/media/email scan
- targeted secret scan
- .NET Page/block contract validation

The .NET contract returned:

- readiness decision: `dotnet-contract-valid-not-cms-import-ready`
- errors: 0
- warnings: 6
- warning codes: `mediaRequirements.unresolved`, `page.reviewOnlyField`

## Warnings

- Three `sectionScopedCss` blocks are not visibly scoped to the expected section class.
- Six MediaAsset requirements remain unresolved.
- Review-only fields remain in the candidate.

## Blockers Before CMS Import

- `media.heroImage.url` has no public URL.
- `media.heroImage.assetId` has no MediaAsset id.
- `media.localImage.url` has no public URL.
- `media.localImage.assetId` has no MediaAsset id.
- `media.closingImage.url` has no public URL.
- `media.closingImage.assetId` has no MediaAsset id.
- Six media requirements still need MediaAsset-backed resolution.
- `workflow.approvedForImport` is not true.
- Human approval is not recorded.
- Public email display policy remains unresolved or intentionally hidden.
- Primary phone/public contact policy remains unresolved or intentionally hidden.
- Service-area wording is not finalized.
- `pageQuality.blockingIssues` still contains import and production approval blockers.

## Blockers Before Local Preview/Draft Import

- Six media requirements have no MediaAsset id.
- Explicit user approval would be required to import a local draft with unresolved media placeholders.
- Review-only fields need either removal, mapping, or explicit local-draft handling.

## Blockers Before Production

- MediaAsset-backed images and public URLs are required.
- Human production approval is not recorded.
- Public contact policy is unresolved.
- Primary phone policy is unresolved.
- Service-area wording is unresolved.
- Static publishing is not eligible.
- No static regeneration or deployment has been authorized.

## Readiness Classification

- Ready for human review: yes
- Ready for shape/preflight review: yes
- Ready for local CMS draft import: conditional only with explicit unresolved-media and review approval
- Ready for CMS import: no
- Ready for static regeneration: no
- Ready for production/indexing: no

## Safety Confirmation

No CMS Page records were changed.
No CMS Theme records were changed.
No MediaAsset records were created.
No production static packages were regenerated.
No Azure, Cloudflare, DNS, Microsoft 365, Bluehost, or deployment actions were performed.
No real email was sent.
No protected config was read or modified.
No Roller content, deployment, or planning was advanced.

## Checks Run

- `node --check tools\import-preflight\import-preflight.mjs`
- `node --check tools\page-intake-normalizer\normalize-page-intake.mjs`
- `node tools\import-preflight\import-preflight.mjs --input content-review\ice-homepage-media-upload-selection\proposed-homepage.media-selected-candidate.json --tenant-id ice-rink-rentals --site-key ice-rink-rentals --route / --mode preflight-only --output content-review\ice-homepage-import-preflight\homepage-import-preflight-result.json`
- `dotnet run --no-build --project tools\dotnet-page-contract\Pumpkin.PageContractTool.csproj -- validate-page --path content-review\ice-homepage-media-upload-selection\proposed-homepage.media-selected-candidate.json`
- `dotnet run --no-build --project tools\dotnet-page-contract\Pumpkin.PageContractTool.csproj -- validate-package --path content-review\ice-homepage-media-upload-selection`
- `node tools\design-system-validation\validate-fixtures.mjs`
- `node tools\default-form-validation\validate-default-form-fixtures.mjs`
- `node tools\media-validation\validate-media-fixtures.mjs`
- `node tools\design-system-validation\validate-tailwind-navigation-fixtures.mjs`
- `node tools\page-intake-normalizer\normalize-page-intake.mjs validate-fixtures`
- JSON parse validation for the new result, manifest, and selected homepage candidate
- unsafe HTML/CSS/form/media/email scan through the import preflight runner
- direct trailing whitespace scan
- protected config/workflow/generated folder/raw media/ZIP/snapshot/dry-run path check
- staged generated/raw media/ZIP check
- targeted high-confidence secret scan over changed text files
- `git diff --check`

Notes:

- Media fixture validation passed with the existing media-validation warning class.
- `git diff --check` exited successfully; Git emitted a line-ending advisory for `tools/page-intake-normalizer/normalize-page-intake.mjs`.

## Expected Decision

- ready for provider/page decision: yes
- ready for local import preflight: yes
- ready for real CMS import: no
- ready for static regeneration: no
- ready for production/indexing: no

## Next Recommended Action

Resolve the MediaAsset bindings and public media URLs first, then rerun this preflight before considering a user-authorized local draft import.
