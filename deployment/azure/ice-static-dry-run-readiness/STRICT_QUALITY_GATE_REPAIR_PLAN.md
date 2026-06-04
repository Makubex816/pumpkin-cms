# Strict Quality Gate Repair Plan

Generated: 2026-06-04

## Current Route Proof

Local route-shape proof is clean:

- snapshot slugs: `contact`, `home`, `service-areas`
- static routes: `/`, `/contact`, `/service-areas`
- copied artifact routes: `/`, `/contact`, `/service-areas`
- preview/obsolete deployable paths: 0

## Current Validator Split

| Validator | Result |
| --- | --- |
| `npm run validate:snapshot:ice` | pass, exit `0` |
| strict static output validator | fail as expected, exit `1`, 22 production errors |
| strict staging package validator | fail as expected, exit `1`, 22 production errors |

## Repair Order

1. CMS metadata write, after explicit approval:
   - set `home.page.seo.robots` to `index,follow`
   - set `service-areas.page.seo.robots` to `index,follow`
   - leave active `contact.page.seo.robots` as `index,follow`
2. Social image metadata repair, after explicit approval:
   - safest temporary repair: clear active `home` and `service-areas` Open Graph/Twitter image fields
   - keep `contact` unchanged
3. Static form endpoint repair, in a separate authorized infrastructure task:
   - configure and verify static endpoint
   - do not infer app form readiness from mailbox readiness
4. Media production URL repair, in a separate authorized media task:
   - publish approved media to production media origin
   - update MediaAsset/public URL records
   - confirm local `/media/...` URLs are gone

## Readiness Classification

| Gate | Status |
| --- | --- |
| static dry run completed | yes |
| static route output ready | yes |
| static output quality gates | no |
| media production URL readiness | no |
| contact form production readiness | no |
| Azure staging readiness | no |
| DNS cutover readiness | no |
| production/indexing readiness | no |

## Required Verification After Repairs

After approved CMS/media/form repairs:

1. Rerun `cd apps/ice-rink-web && npm run export:static:ice:cms`.
2. Confirm route output remains exactly `/`, `/contact`, `/service-areas`.
3. Confirm no preview or obsolete deployable paths exist.
4. Confirm no noindex meta appears on approved production pages.
5. Confirm no unapproved rendered social image URL remains.
6. Confirm strict static output validator passes.
7. Confirm strict staging package validator passes.

## Actions Not Performed

- no CMS write
- no MediaAsset write
- no media upload
- no Azure resources, Cosmos resources, Blob containers, DNS changes, Cloudflare changes, or deployment
- no email or Microsoft 365 action
- no protected config access
- no Roller work
