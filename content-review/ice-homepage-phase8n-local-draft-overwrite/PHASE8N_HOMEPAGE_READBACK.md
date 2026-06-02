# Phase 8N Homepage Readback

Readback file: `phase8n-homepage-readback.json`

Readback status: performed

- Route/pageSlug home: yes
- Workflow draft/needs_review: yes
- Production/publish approval false: yes
- PageVersion incremented: yes, 10 -> 11
- Revision incremented: yes, 6 -> 7
- Rollback metadata exists: yes
- Production renderer variants present in active readback: no
- Supported PageMedia assetId/url values present: partially, hero/corporate/holiday supported fields remain
- Full tenant-prefixed MediaAsset IDs preserved in active readback: no
- Selected mailbox field preserved in active readback: no
- Public email hidden: yes

The CMS write succeeded, but post-write compatibility is blocked by current .NET Page model serialization. The active readback strips Phase 8N sectionVariant markers and review-only domain/media fields.
