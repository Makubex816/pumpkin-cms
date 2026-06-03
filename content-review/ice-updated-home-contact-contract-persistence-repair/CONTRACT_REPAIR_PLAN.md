# Contract Repair Plan

## Completed Repairs

- Added first-class .NET model fields for updated page block content so key fields are not left to incidental extension handling.
- Added typed media/CTA/form/service-area properties needed by the updated homepage and contact page package.
- Added a domain routing guard for `ice-rink-rentals` home/contact pages requiring the review-only mailbox/display-policy/ref contract.
- Added `updated_home_contact_package_import` to .NET and TypeScript page change-source contracts.
- Added a dedicated `validate-updated-home-contact` command to the .NET page contract tool.
- Decoupled the contract tool build from a full API project rebuild by compiling the shared guard source directly.
- Repaired import preflight to detect updated home/contact production-render-compatible candidates and require persistence-sensitive validation.
- Repaired normalizer defaults so fixture and intake paths emit the explicit review-only mailbox and display-policy values expected by the guard.

## Files Changed

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

## Still Intentionally Out of Scope

- No CMS reimport.
- No CMS record write.
- No service-area page work.
- No MediaAsset, Theme, static generation, deployment, DNS, email provider, Roller, or protected-config changes.
