# Homepage Import Preflight Blockers

## Local Draft Import

- 6 required media requirements have no MediaAsset id.
- Local draft import needs explicit unresolved-media approval.
- Review-only fields are still present.

## CMS Import

- `media.heroImage.url` has no public URL.
- `media.heroImage.assetId` has no MediaAsset id.
- `media.localImage.url` has no public URL.
- `media.localImage.assetId` has no MediaAsset id.
- `media.closingImage.url` has no public URL.
- `media.closingImage.assetId` has no MediaAsset id.
- 6 media requirements remain unresolved.
- `workflow.approvedForImport` is not true.
- Human approval is not recorded.
- Public email display policy remains unresolved or intentionally hidden.
- Primary phone/public contact policy remains unresolved or intentionally hidden.
- Service-area wording is not finalized.
- `pageQuality.blockingIssues` still includes import and production approval blockers.

## Static Regeneration

- Static regeneration needs approved MediaAsset-backed media or an explicit placeholder policy.
- Service-area wording should be finalized before static generation.
- `staticPublishing.staticEligible` is not true.

## Production

- Production requires approved MediaAsset-backed images and public URLs.
- `workflow.approvedForPublish` is not true.
- Human approval is not recorded.
- Public contact email policy remains unresolved.
- Primary phone/public contact policy remains unresolved.
- Service-area wording is not finalized.
- `staticPublishing.staticEligible` is not true.

