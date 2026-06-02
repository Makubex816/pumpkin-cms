# Pumpkin Ice Homepage Phase 8N Contract Persistence Repair Report

Generated: June 2, 2026

## Scope

Primary site: IceSkatingRinkRentals.com.

This was a non-mutating contract repair run. No CMS Page records, Theme records, MediaAsset records, static output, deployment, DNS, email/provider settings, or Roller work were changed.

## Git Start State

Start-state commands were run:
- `git status --short`
- `git log --oneline -12`

Start status was not fully clean:
- `M content-review/ice-homepage-phase8n-crm-scaffold-validated/phase8n-import-preflight-result.json`

This was an existing Phase 8N validation artifact and was treated as relevant prior work. Its current diff is timestamp-only.

Recent commits at start included:
- `97ddf11 Add Phase 8N homepage local draft overwrite report`
- `34eef51 Fix Phase 8N homepage overwrite route guard`
- `e2d150b Add Ice homepage Phase 8N scaffold validation package`
- `e465511 Add Ice homepage draft preview and production rendering support`

## Current Capability Assessment

Previous Phase 8N draft overwrite:
- Successfully updated local draft route `/`.
- Preserved draft/needs_review workflow.
- Left `/contact` unchanged.
- Left `/service-areas` unchanged as expected 404.
- Did not update Theme/MediaAsset/static/deploy/DNS/email/Roller.

Previous readback problem:
- Production section variants were stripped.
- Full tenant-prefixed MediaAsset IDs and media metadata were stripped.
- Selected mailbox and public email display policy metadata were stripped.
- The old .NET round-trip check missed the loss because it compared the already-deserialized model to itself.

## Repair Summary

Patched:
- .NET Page/media/domain routing models.
- .NET typed block content models.
- .NET contract validator.
- TypeScript Page/IHtmlBlock contracts.
- Admin editor/import helper preservation paths.
- Local import preflight.
- Phase 8N persistence comparison tooling.

The contract now preserves:
- `sectionVariant` and `variant`.
- Block production section values.
- `mediaAssetId`, `assetId`, and tenant-prefixed MediaAsset IDs.
- Media metadata for logo/setup/hero/Open Graph/use-case fields.
- `domainRouting.selectedMailbox`.
- `domainRouting.publicEmailDisplayPolicy`.
- `selectedEmailProvider`, `pumpkinAppSendStatus`, `leadRecipientRef`, and `staticEndpointRef` when present.
- Placeholder refs only; no provider credentials or M365 secrets.

## Files Changed

Core .NET:
- `apps/pumpkin-net-models/Models/Page.cs`
- `apps/pumpkin-net-models/Models/HtmlBlockBase.cs`
- Typed block models under `apps/pumpkin-net-models/Models/`
- `tools/dotnet-page-contract/Program.cs`

TypeScript/admin:
- `packages/pumpkin-ts-models/src/models/Page.ts`
- `packages/pumpkin-ts-models/src/models/IHtmlBlock.ts`
- `apps/admin/src/app/dashboard/pages/[id]/edit/page.tsx`
- `apps/admin/src/app/dashboard/pages/import-export/page.tsx`
- `apps/admin/src/lib/page-repairs.ts`

Tooling:
- `tools/import-preflight/import-preflight.mjs`
- `tools/phase8n-homepage-overwrite/validate-contract-persistence.mjs`

Reports:
- `content-review/ice-homepage-phase8n-contract-persistence-repair/`
- `PUMPKIN_ICE_HOMEPAGE_PHASE8N_CONTRACT_PERSISTENCE_REPAIR_REPORT.md`

## Validation Results

Passed:
- `node --check tools/import-preflight/import-preflight.mjs`
- `node --check tools/phase8n-homepage-overwrite/validate-contract-persistence.mjs`
- `apps/admin`: `npm run type-check`
- `packages/pumpkin-ts-models`: `tsc -p tsconfig.json --noEmit` using the admin app's installed `@types`
- Temp .NET contract tool build compiled `pumpkin-net-models`, `pumpkin-api`, and `Pumpkin.PageContractTool`.
- .NET contract validation on Phase 8N candidate: `Ok: true`.
- `.NET ProductionFieldPersistenceOk: true`.
- Import preflight after repair: shape valid, local draft import shape valid.
- Phase 8N persistence tool: required candidate fields present, no non-tenant MediaAsset IDs.
- Design-system fixtures: passed.
- Tailwind/navigation fixtures: passed.
- Media fixtures: passed with known warning class.
- Default form fixtures: passed.
- Page intake normalizer fixtures: passed.
- JSON parse validation for repair JSON artifacts: passed.
- `git diff --check`: passed with LF/CRLF warnings only.
- Direct trailing whitespace scan: passed.
- Targeted secret scan: passed.
- Protected config/workflow/generated-folder status check: no changes reported.
- Staged artifact check: no staged files.

Expected warnings:
- Candidate still has review-only root fields that are not canonical .NET Page fields.
- Homepage has no `formBlock` in this candidate.
- CMS import remains blocked by human approval and unresolved business/public contact policy.

Build note:
- Direct `dotnet build apps/pumpkin-net-models/pumpkin-net-models.csproj -o <temp>` was blocked by a local `VBCSCompiler` lock on the repo `obj` DLL.
- The temp contract-tool build succeeded and was used for validation.

## Readback Comparison

`phase8n-readback-persistence-comparison.json` compares the repaired candidate to the old active readback.

Result:
- Drift detected in the old readback.
- This is expected because no CMS rewrite was performed in this repair run.
- A future authorized homepage-only reimport should re-run this comparison after readback.

## Readiness

Ready for another provider decision: not applicable.

Ready for Phase 8N homepage draft reimport: yes, with explicit user authorization and valid admin auth.

Ready for real SMTP sending: no.

Ready for static regeneration: no.

Ready for production/indexing: no.

## Remaining Work Before Reimport

- Obtain explicit authorization to re-run the homepage-only draft overwrite.
- Use valid admin auth without printing secrets.
- Require import preflight `productionFieldPersistenceOk: true`.
- Snapshot current homepage before write.
- Write route `/` only.
- Verify readback persistence with the new comparison tool.
- Verify `/contact` unchanged.
- Verify `/service-areas` unchanged or still expected 404.

## Confirmations

- No CMS write was performed.
- No Theme record was changed.
- No MediaAsset record was changed.
- No static package was regenerated.
- No deployment was performed.
- No DNS/email/provider action was performed.
- No protected config was read or modified.
- RollerRinkRentals.com remains paused.
