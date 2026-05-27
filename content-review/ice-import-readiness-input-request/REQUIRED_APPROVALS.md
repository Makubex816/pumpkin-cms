# Required Approvals

CMS import remains blocked until the approvals below are explicitly recorded.

## Page Approvals

| Approval | Current status | Blocks CMS import | Notes |
| --- | --- | --- | --- |
| Homepage copy approval | not approved | yes | Includes headline, body copy, FAQs, CTAs, and visible claims. |
| Homepage design approval | not approved | yes | Includes media placements, layout intent, semantic classes, and section variants. |
| Contact page form approval | not approved | yes | The visible Pumpkin `formBlock` is ready, but user approval is still needed. |
| Contact page copy approval | not approved | yes | Includes quote-request guidance and form-adjacent copy. |
| Service areas copy approval | not approved | yes | Must avoid unsupported geography claims. |
| Service areas route/canonical approval | pending | yes | Confirm `/service-areas` as canonical. |

## SEO And Schema Approvals

| Approval | Current status | Blocks CMS import | Notes |
| --- | --- | --- | --- |
| SEO title/meta approval | not approved | yes | Confirm titles and descriptions for homepage/contact/service areas. |
| Schema recommendation approval | not approved | yes | Business identity and contact policy must be resolved first. |
| Open Graph image approval | not approved | yes | Requires MediaAsset selection or approved placeholder policy. |

## Policy And Media Approvals

| Approval | Current status | Blocks CMS import | Notes |
| --- | --- | --- | --- |
| Phone/email policy approval | not approved | yes | Decide display vs form-only. |
| Legal/business display name approval | not approved | yes | Needed for page copy/footer/schema readiness. |
| Media approval | not approved | yes | Approve files, slots, alt text, source/license, and upload. |
| MediaAsset record creation approval | not approved | yes | Needed before creating local MediaAsset records from supplied files. |
| Admin import/export preflight approval | not approved | yes | Must happen after media/business/page approvals. |

## What Can Be Deferred Until Staging

Only explicitly approved deferrals can move to staging. Candidates:

- optional non-blocking event-card images
- optional secondary captions
- final production social crop if an approved draft OG image exists

Do not defer legal/business identity, contact policy, required hero/OG media, or import preflight without explicit approval.

