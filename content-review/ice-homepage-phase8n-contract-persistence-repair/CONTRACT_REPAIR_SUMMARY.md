# Contract Repair Summary

Changes made:
- Added .NET extension-data preservation to `HtmlBlockBase` and typed block content models.
- Added explicit `sectionVariant` support across production-relevant block content classes.
- Added page media fields for full MediaAsset-backed references, including `mediaAssetId`, `publicUrl`, slot refs, usage metadata, and official media metadata.
- Added page media slots for logo, setup, hero, corporate, holiday, and setup use-case references.
- Added domain routing fields for selected mailbox and public email display policy metadata.
- Updated TypeScript Page/IHtmlBlock contracts to align with the widened .NET contract.
- Updated admin editor/import helpers so Open Graph media and domain routing extras are not narrowed to old shapes.
- Updated import preflight to build and run the current .NET contract tool from a temp folder and to require Phase 8N persistence-sensitive fields.
- Added `tools/phase8n-homepage-overwrite/validate-contract-persistence.mjs` for non-mutating candidate/readback persistence comparison.

Fields now preserved:
- `sectionVariant` and `variant`.
- Production block extension fields.
- Tenant-prefixed `mediaAssetId` plus `assetId`.
- Media metadata including logo/setup/hero/Open Graph/use-case title, alt, caption, description, status, usage type, and refs.
- `domainRouting.selectedMailbox`.
- `domainRouting.publicEmailDisplayPolicy`.
- `selectedEmailProvider`, `pumpkinAppSendStatus`, `leadRecipientRef`, and `staticEndpointRef` when present.
- Provider or M365-style refs only as placeholder metadata; no credentials are introduced.

Non-goals:
- No CMS Page rewrite.
- No Theme update.
- No MediaAsset update.
- No static regeneration.
- No email sending or provider configuration.
- No deployment.

