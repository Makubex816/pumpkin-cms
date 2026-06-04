# Pumpkin Ice Static Dry Run Readiness Report

Generated: 2026-06-04

## Scope

This report records safe local static dry-run/readiness proof work for IceSkatingRinkRentals.com.

No CMS records, Theme records, MediaAsset records, Azure resources, Cosmos resources, Blob containers, Cloudflare DNS records, Microsoft 365 settings, email/provider settings, deployments, or Roller work occurred. No protected config was read and no secrets, API keys, JWTs, tokens, connection strings, or provider credentials were printed.

Latest repair planning pass was documentation-only. Live CMS inspection was not required because the current CMS snapshot and static output already captured the active page metadata used by the latest successful export.

## Start State

Branch: `feature/admin-page-editor-import-export`

`git status --short` at start was not clean. Existing tracked static readiness tooling/docs changes were present, along with untracked content-review input directories. These pre-existing changes were not reverted or staged.

Recent log at start included:

```text
b55cddb Complete Ice static dry-run route proof
0caed80 Repair Ice static dry-run snapshot auth and route filtering
12b5adb Repair Ice static deployment readiness gates
dc8d149 Add Ice static media deployment readiness report
1438480 Add Ice production architecture lock
799268f Add Ice live CMS pages approval lock
492a2a9 Add Ice final contact live CMS promotion report
5800b86 Add Ice contact media binding report
df01d84 Add Ice contact draft preview support
af471be Add Ice final contact local draft import report
8d66530 Add Ice final contact package intake
aa556a9 Add Ice service areas region grid polish report
9f2dbd2 Add Ice service areas live CMS promotion report
```

## Environment Presence

Required shell env presence:

| Env var | Status |
| --- | --- |
| `PUMPKIN_API_URL` | PRESENT |
| `ICE_RINK_RENTALS_API_KEY` | PRESENT |
| `ICE_RINK_RENTALS_TENANT_ID` | PRESENT |
| `PUMPKIN_ADMIN_JWT` | PRESENT |

Token values were not printed.

## Local Tooling Changes

Minimal local fixes now in place:

- `apps/ice-rink-web/scripts/snapshot-cms-content.mjs` supports the approved temp admin JWT file as a fallback and uses read-only `GET /api/admin/themes/{tenantId}/active` when an admin token is available.
- `snapshot-cms-content.mjs` filters the Ice CMS snapshot to approved slugs only: `home`, `contact`, `service-areas`. The manifest records the original discovered count and excluded slugs.
- `snapshot-cms-content.mjs` scopes the fetched Ice `theme.menu` for local route-shape proof only, adding `/` when missing and excluding non-approved routes from the local snapshot copy without mutating CMS/theme records.
- `snapshot-cms-content.mjs` and `apps/ice-rink-web/scripts/static-publish.mjs` separate route-shape proof from production-readiness gates: noindex, local media URLs, unapproved production image URLs, and missing static form endpoint now remain warnings/blockers for production readiness instead of stopping the local route-shape dry run.
- `static-publish.mjs` rejects any non-approved Ice static slug and removes excluded preview output folders/chunks before copying the local static artifact.
- `apps/ice-rink-web/next.config.js` omits preview rewrites when `PUMPKIN_RENDER_MODE=static`, so generated static output does not carry `/__preview/...` or `/draft-preview/...` rewrites.

Roller behavior was not changed.

## Command

Safe Ice-only command:

```powershell
cd apps/ice-rink-web
npm run export:static:ice:cms
```

`npm run publish:dry-run:cms` was not used because it runs both Ice and Roller. Roller remains paused.

## Current Result

Static dry run completed: yes.

Command executed: yes.

Exit code: `0`

Current snapshot summary:

| Field | Result |
| --- | --- |
| discoveredPageCount | 6 |
| pageCount after approved-scope filter | 3 |
| required slugs present | `home`, `contact`, `service-areas` |
| excluded slugs | `events-holiday-activations`, `ice-rink-rentals`, `phase-5a-csv-import-54754949` |
| themeSnapshot | true |
| theme 401 | fixed |

Fresh generated route output:

| Location | Routes |
| --- | --- |
| `apps/ice-rink-web/out` | `/`, `/contact`, `/service-areas` |
| `apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out` | `/`, `/contact`, `/service-areas` |

Static route output ready: yes.

## Diagnosis

Theme 401:

- previous failing path: public theme read returned 401
- current safe read path: read-only admin active-theme endpoint using admin JWT bearer
- current result: fixed locally; `themeSnapshot: true`

Theme navigation:

- source: fetched active theme `theme.menu`
- obsolete entries found by route: `/ice-rink-rentals`, `/events-holiday-activations`, `/ice-rink-rentals#faq`
- missing approved route: `/`
- local result: snapshot copy is scoped to `/`, `/contact`, and `/service-areas` for route-shape proof only
- CMS/theme write performed: no
- recommended CMS/theme change: update active theme menu to approved production routes only: `/`, `/contact`, `/service-areas`

Noindex:

- source field: CMS page `seo.robots`
- render path: `apps/ice-rink-web/src/app/page.tsx` and `apps/ice-rink-web/src/app/[...slug]/page.tsx` call `buildMetadata(...)`, and `apps/ice-rink-web/src/lib/metadata.ts` emits `robots: seo.robots || 'index, follow'`
- `home`: source `page.seo.robots = "noindex, nofollow"` renders `<meta name="robots" content="noindex, nofollow"/>` in `apps/ice-rink-web/out/index.html`
- `contact`: source `page.seo.robots = "index,follow"` renders `<meta name="robots" content="index,follow"/>` in `apps/ice-rink-web/out/contact/index.html`; its revision snapshot still contains stale `noindex,nofollow`, but the active page field does not
- `service-areas`: source `page.seo.robots = "noindex, nofollow"` renders `<meta name="robots" content="noindex, nofollow"/>` in `apps/ice-rink-web/out/service-areas/index.html`
- local result: noindex is a production/indexing readiness blocker, not a route-shape blocker
- local tooling fix status: no safe local tooling fix is appropriate because overriding `seo.robots` would hide a real production indexing blocker
- CMS metadata write performed: no
- recommended CMS change: when production approval is granted, remove noindex from `home` and `service-areas` or set their robots metadata to `index,follow`

Media:

- source: approved CMS pages and revision snapshots still contain local `/media/ice-rink-rentals/...` URLs
- strict validators report one unique unapproved rendered image URL: `https://iceskatingrinkrentals.com/media/ice-rink-rentals/2026/06/winterfesticerinkrentals-324b1b89777d.png`
- rendered locations: `apps/ice-rink-web/out/index.html`, `apps/ice-rink-web/out/index.txt`, `apps/ice-rink-web/out/service-areas/index.html`, and `apps/ice-rink-web/out/service-areas/index.txt`
- source fields: `home` and `service-areas` `page.seo.openGraph.og:image` and `page.seo.twitterCard.twitter:image` contain `/media/ice-rink-rentals/2026/06/winterfesticerinkrentals-324b1b89777d.png`; `apps/ice-rink-web/src/lib/metadata.ts` absolutizes that relative path to the site domain for Open Graph/Twitter metadata
- local media URL render path: polished block rendering reads `publicUrl`/`url` from CMS media objects and renders them directly in `<img>` tags
- local result: media issues remain production-readiness blockers, not route-shape blockers
- MediaAsset writes/uploads performed: no
- required future action: publish approved media to the production media origin and update MediaAsset/public URL records in a separately authorized task

Static contact endpoint:

- source: `home` and `contact` contain `formBlock`
- current state: static form endpoint is missing/unverified for production readiness
- local result: form endpoint remains a production-readiness blocker, not a route-shape blocker
- endpoint deployment/email/Microsoft 365 action performed: no

## Repair Plans

Documentation-only repair plans were added:

- `deployment/azure/ice-static-dry-run-readiness/NOINDEX_REPAIR_PLAN.md`
- `deployment/azure/ice-static-dry-run-readiness/SOCIAL_IMAGE_URL_REPAIR_PLAN.md`
- `deployment/azure/ice-static-dry-run-readiness/STRICT_QUALITY_GATE_REPAIR_PLAN.md`

Exact CMS metadata repair proposed, pending explicit approval:

| Page slug | Field | Current value | Proposed value |
| --- | --- | --- | --- |
| `home` | `page.seo.robots` | `noindex, nofollow` | `index,follow` |
| `service-areas` | `page.seo.robots` | `noindex, nofollow` | `index,follow` |
| `contact` | `page.seo.robots` | `index,follow` | no change |

Exact social image repair options proposed, pending explicit approval:

| Rank | Option | Summary |
| --- | --- | --- |
| 1 | Option A | clear/omit `home` and `service-areas` active `page.seo.openGraph.og:image` and `page.seo.twitterCard.twitter:image` until production media URLs are ready |
| 2 | Option B | update static metadata generation to omit OG/Twitter image tags when values resolve from local `/media/...`, while keeping media production readiness `no` |
| 3 | Option C | after media infrastructure exists, replace social image fields with `https://media.iceskatingrinkrentals.com/...` production media URLs |

Recommended next write step requiring explicit approval: apply Option A and the noindex CMS metadata changes to the active `home` and `service-areas` pages only. Do not touch active `contact`; its robots and social image fields are already acceptable for this specific blocker set.

## Validation

Direct route/snapshot validation after the successful run:

| Check | Result |
| --- | --- |
| snapshot slugs exactly `contact`, `home`, `service-areas` | pass |
| snapshot discovered count records 6 | pass |
| excluded slugs recorded | pass |
| `themeSnapshot` true | pass |
| `out` routes exactly `/`, `/contact`, `/service-areas` | pass |
| copied artifact routes exactly `/`, `/contact`, `/service-areas` | pass |
| deployable preview/obsolete route paths | 0 found |
| `/__preview/` and `/draft-preview/` route references in output scan | 0 found |
| `contactus@` | 0 found |
| `data:image` or `base64` image payload markers | 0 found |
| exact unsupported East Coast service claim patterns checked | 0 found |

Note: Party Pros East Coast partner/resource wording and logo metadata remain in content; the compact check did not find unsupported service-area claim phrases such as `East Coast service`, `serving the East Coast`, or `East Coast coverage`.

Strict production/staging validators remain negative controls:

| Validator | Exit | Expected blockers |
| --- | --- | --- |
| `npm run validate:snapshot:ice` | `0` | route/snapshot validation passed; production-readiness blockers remain warnings |
| `deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out apps/ice-rink-web/out` | `1` | 22 errors: local media URLs, unapproved image URLs, noindex on `index.html` and `service-areas/index.html`, missing/unverified static form endpoint |
| `deployment/static-azure/validate-staging-package.mjs --site ice-rink-rentals --folder apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out` | `1` | 22 errors: local media URLs, unapproved image URLs, noindex on `index.html` and `service-areas/index.html`, missing/unverified static form endpoint |

No stale snapshot/static output was accepted as readiness proof.

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

## Checks

- touched script syntax check: pass
- Ice-only CMS static export: pass, exit `0`
- route/snapshot shape validation: pass
- strict production static validator: rejects output as expected
- strict staging package validator: rejects package as expected
- manifest JSON parse: pass
- node --check for changed JS/MJS: pass
- git diff --check: pass, with line-ending warnings only
- trailing whitespace scan for report/package: pass
- protected/generated/raw artifact path check: pass
- targeted secret scan: pass after excluding scanner detector-definition lines
- staged generated static artifacts: none staged
- no Azure resources created: yes
- no Cloudflare changes: yes
- no CMS writes: yes
- no MediaAsset writes: yes
- no static deployment: yes
- Roller untouched: yes

## Next Recommended Action

Do not proceed to Azure setup, DNS cutover, deployment, or production indexing. The next authorized write should be explicitly scoped CMS metadata repair only: set `home` and `service-areas` `page.seo.robots` to `index,follow` and clear/omit their active Open Graph/Twitter local `/media/...` social image fields, then rerun the Ice-only export and strict validators.
