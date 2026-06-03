# Pumpkin Ice Updated Home/Contact Contract Persistence Repair Report

## Verdict

Repair-only run completed. I did not write CMS records and did not reimport `/` or `/contact`. The prior readback stripping was traced to a page/block/domain-routing contract persistence gap. The local models, guards, contract tool, preflight, and normalizer have been repaired so the updated home/contact package now has explicit validation for the fields that were stripped last time.

## Evidence Package

- Folder: `content-review/ice-updated-home-contact-contract-persistence-repair/`
- Manifest: `content-review/ice-updated-home-contact-contract-persistence-repair/manifest.json`
- Detailed stripped-field audit: `content-review/ice-updated-home-contact-contract-persistence-repair/STRIPPED_FIELDS_AUDIT.md`
- Roundtrip result: `content-review/ice-updated-home-contact-contract-persistence-repair/roundtrip-validation-result.json`
- Preflight results: `content-review/ice-updated-home-contact-contract-persistence-repair/homepage-import-preflight-after-repair.json`, `content-review/ice-updated-home-contact-contract-persistence-repair/contact-import-preflight-after-repair.json`

## What Was Repaired

- `apps/pumpkin-net-models/Models/HtmlBlockBase.cs`
- `apps/pumpkin-net-models/Models/HeroBlock.cs`
- `apps/pumpkin-net-models/Models/TrustBarBlock.cs`
- `apps/pumpkin-net-models/Models/CardGridBlock.cs`
- `apps/pumpkin-net-models/Models/HowItWorksBlock.cs`
- `apps/pumpkin-net-models/Models/PrimaryCtaBlock.cs`
- `apps/pumpkin-net-models/Models/ServiceAreaMapBlock.cs`
- `apps/pumpkin-net-models/Models/FormBlock.cs`
- `apps/pumpkin-api/Services/DesignSystemGuard.cs`
- `apps/pumpkin-api/Services/PageRevisionHelper.cs`
- `packages/pumpkin-ts-models/src/models/Page.ts`
- `tools/dotnet-page-contract/Program.cs`
- `tools/dotnet-page-contract/Pumpkin.PageContractTool.csproj`
- `tools/import-preflight/import-preflight.mjs`
- `tools/page-intake-normalizer/normalize-page-intake.mjs`

## Stripping Confirmed

- Homepage and contact candidates both had explicit `publicEmailDisplayPolicy`, `selectedMailbox`, `selectedMailboxMetadata`, `leadRecipientRef`, and `staticEndpointRef`.
- Prior readbacks omitted the explicit domain-routing mailbox/policy/ref metadata on both pages.
- Homepage candidate had page media slots with tenant-prefixed `mediaAssetId` values; prior readback kept only a reduced set and omitted `mediaAssetId`.
- Block-level variants and block media refs were present in candidates and absent in prior readbacks.
- Contact form kept core refs in readback but lost `selectedMailboxMetadata` and `emailSendingEnabled`.

## Validation Snapshot

- Updated home/contact .NET roundtrip contract: passed, exit code 0.
- Homepage preflight after repair: shape passed, local draft import passed, CMS import false, production false, updated persistence check true.
- Contact preflight after repair: shape passed, local draft import passed, CMS import false, production false, updated persistence check true.
- .NET model build: passed.
- .NET contract tool build/publish: passed.
- API temp-output build: passed.
- Ice rink web type-check: passed.
- Pumpkin TypeScript models checked with app-local `tsc`: passed.
- Package-local `npm run build` for `packages/pumpkin-ts-models` still lacks a local `tsc` binary; that is a tooling dependency gap, not a contract failure.

## Next Reimport Status

The package is ready for another local draft import attempt after the local API/import process is rebuilt or restarted to use these repairs. This report intentionally stops before any write.

## Scope Confirmation

No service-area pages, Theme records, MediaAsset records, static generation, deployment, DNS/email/provider settings, Roller code, or protected config were touched.
