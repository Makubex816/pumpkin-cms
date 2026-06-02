# Remaining Blockers

Run blockers after successful homepage draft write:

- Admin PUT succeeded and created homepage revision 7, but post-write verification failed because canonical .NET Page models stripped Phase 8N sectionVariant markers from active blocks.
- Active readback did not preserve full tenant-prefixed MediaAsset IDs or logo/setup media metadata fields; only supported PageMedia assetId/url values remain.
- Active readback did not preserve selectedMailbox/publicEmailDisplayPolicy fields; publicContactEmail remains hidden and no email action occurred.
- A follow-up model/contract fix is required before this draft should be treated as Phase 8N production-render compatible.

Before static regeneration:

- Do not regenerate static from this draft yet.
- Fix or explicitly accept the Page model serialization limitations.
- Manual browser preview review is required.
- Static regeneration must be separately authorized.
- `staticPublishing.staticEligible` remains false.

Before production/indexing:

- Production approval and publish approval are still false.
- Final public contact policy and phone/email display decision remain under review.
- Deployment and indexing must be separately authorized.
