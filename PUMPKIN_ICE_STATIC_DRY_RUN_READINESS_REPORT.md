# Pumpkin Ice Static Dry Run Readiness Report

Generated: 2026-06-04

## Scope

This report records safe local static dry-run/readiness proof work for IceSkatingRinkRentals.com.

No CMS records, Theme records, MediaAsset records, Azure resources, Cosmos resources, Blob containers, Cloudflare DNS records, Microsoft 365 settings, email/provider settings, deployments, or Roller work occurred. No protected config was read and no secrets, API keys, JWTs, tokens, connection strings, or provider credentials were printed.

## Start State

Branch: `feature/admin-page-editor-import-export`

`git status --short` at start was not clean. Existing tracked static readiness tooling/docs changes were present, along with the untracked readiness report/package and untracked content-review input directories. These pre-existing changes were not reverted or staged.

Recent log:

```text
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
96d48cb Add Ice service areas polish report
```

## Environment Presence

Required shell env presence:

| Env var | Status |
| --- | --- |
| `PUMPKIN_API_URL` | PRESENT |
| `ICE_RINK_RENTALS_API_KEY` | PRESENT |
| `ICE_RINK_RENTALS_TENANT_ID` | PRESENT |
| `PUMPKIN_ADMIN_JWT` | PRESENT |

Approved temp-token mechanism:

| Source | Status |
| --- | --- |
| `PUMPKIN_ADMIN_JWT` temp file | PRESENT |

Token values were not printed.

## Local Tooling Changes

Minimal local tooling fixes were made:

- `apps/ice-rink-web/scripts/snapshot-cms-content.mjs` now supports the same temp admin JWT file used by auth diagnostics, after env-token sources.
- `snapshot-cms-content.mjs` now fetches the active theme through read-only `GET /api/admin/themes/{tenantId}/active` when an admin token is available; it falls back to the public API-key theme endpoint only when no admin token is available.
- `snapshot-cms-content.mjs` now filters the Ice CMS snapshot to approved slugs only: `home`, `contact`, `service-areas`. The manifest records the original discovered count and excluded slug names.
- `apps/ice-rink-web/scripts/static-publish.mjs` now rejects any non-approved Ice static slug, not only the two known obsolete slugs.

Roller behavior was not changed.

## Command

Safe Ice-only command:

```powershell
cd apps/ice-rink-web
npm run export:static:ice:cms
```

`npm run publish:dry-run:cms` was not used because it runs both Ice and Roller. Roller remains paused.

## Prior Blockers

Previous env/JWT blockers:

- attempt with `ICE_RINK_RENTALS_API_KEY` missing stopped before a usable snapshot
- attempt with `PUMPKIN_API_URL`, `ICE_RINK_RENTALS_API_KEY`, and `ICE_RINK_RENTALS_TENANT_ID` missing stopped before command execution
- attempt without admin JWT returned `pageCount: 0`, missed `home`, `contact`, `service-areas`, and warned `theme returned 401 Unauthorized`

JWT auth is now resolved for page discovery. The current snapshot no longer returns `pageCount: 0`.

## Current Result

Static dry run completed: no.

Command executed: yes.

Exit code: `1`

The command stopped during `snapshot:cms:ice`.

Current snapshot summary:

| Field | Result |
| --- | --- |
| discoveredPageCount | 6 |
| pageCount after approved-scope filter | 3 |
| required slugs present | `home`, `contact`, `service-areas` |
| excluded slugs | `events-holiday-activations`, `ice-rink-rentals`, `phase-5a-csv-import-54754949` |
| themeSnapshot | true |
| theme 401 | fixed; not present in current run |

Current exact blocker:

```text
snapshot:cms:ice now proves the approved three-page snapshot shape and theme read, but still fails production-readiness validation because approved CMS pages contain local-dev media URLs, home/service-areas noindex metadata, missing/unverified static form endpoint settings, and theme navigation still references obsolete routes/misses root navigation.
```

The command did not proceed to `validate:snapshot:ice` in the chain, static build, static generation, release packaging, staging, deployment, CMS writes, Theme writes, or MediaAsset writes.

## Diagnosis

Theme 401:

- previous endpoint: `GET /api/themes/{tenantId}` using the Ice API key bearer
- available safe endpoint: `GET /api/admin/themes/{tenantId}/active` using admin JWT bearer
- current result: fixed locally for snapshot reads; `themeSnapshot: true`
- remaining theme issue: fetched theme menu still contains obsolete URLs `/ice-rink-rentals`, `/events-holiday-activations`, and `/ice-rink-rentals#faq`, and it does not include `/`

PageCount 6 / route scope:

- admin page discovery returned six published pages
- approved slugs are `home`, `contact`, `service-areas`
- non-approved slugs are now excluded from the local Ice snapshot and recorded by slug only
- static-publish validation now rejects any non-approved Ice slug

Noindex:

- source is CMS page metadata, not a static export environment issue
- `home`: `noindex, nofollow`
- `contact`: `index,follow`
- `service-areas`: `noindex, nofollow`
- no CMS metadata write was performed

Media:

- local `/media/ice-rink-rentals/...` URLs remain in approved CMS pages and revision snapshots
- these URLs are still correctly classified as not production-ready
- no MediaAsset records were updated and no media was uploaded

Static contact endpoint:

- `home` and `contact` contain `formBlock`
- current validators intentionally require a configured, verified static endpoint before production static readiness can pass
- no endpoint was deployed, no email was sent, and Microsoft 365 settings were not touched

## Snapshot Checks

| Check | Result |
| --- | --- |
| approved CMS slugs present | yes |
| snapshot slugs exactly approved set | yes |
| `/__preview/...` marker | absent |
| `/draft-preview/...` marker | absent |
| `contactus@` | absent |
| draft-only notes | present in revision metadata |
| East Coast phrase | present |
| local `/media/...` URLs | present and rejected |
| base64 image payloads | not detected in compact scan |
| fake placeholder image URLs | not detected in compact scan |

No fresh static route output was produced, so static route output readiness is still no.

## Stale Artifact Rejection

Existing `apps/ice-rink-web/out` was rejected as stale/wrong-site output:

- missing `service-areas/index.html`
- contains Roller-domain references
- `robots.txt` does not reference the Ice sitemap
- static form endpoint is missing/unverified
- production pages contain `noindex`

Existing `apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out` was rejected as stale Ice output:

- missing `service-areas/index.html`
- obsolete `ice-rink-rentals/index.html` present
- obsolete `events-holiday-activations/index.html` present
- static manifest missing `service-areas`
- static manifest contains obsolete Ice slugs
- static form endpoint is missing/unverified

No stale snapshot/static output was accepted as readiness proof.

## Readiness Classification

| Gate | Status |
| --- | --- |
| static dry run completed | no |
| static route output ready | no |
| media production URL readiness | no |
| contact form production readiness | no |
| Azure staging readiness | no |
| DNS cutover readiness | no |
| production/indexing readiness | no |

## Checks

- touched script syntax check: pass
- manifest JSON parse: pass
- node --check for changed JS/MJS: pass, with line-ending warnings only
- git diff --check: pass, with line-ending warnings only
- trailing whitespace scan for report/package: pass
- protected/generated/raw artifact path check: protected config/static deploy artifacts not staged; existing untracked content-review input directories were present at start and remain untracked
- targeted secret scan for report/package: pass
- no Azure resources created: yes
- no Cloudflare changes: yes
- no CMS writes: yes
- no MediaAsset writes: yes
- no static deployment: yes
- no production static artifacts staged: pass
- Roller untouched: pass

## Next Recommended Action

Do not proceed to Azure setup, DNS cutover, deployment, or production indexing. The next authorized work should clear CMS/theme/media/form blockers: remove `noindex` from approved production pages, update or approve theme navigation for `/`, `/contact`, and `/service-areas`, publish/record production media URLs, verify a static contact form endpoint, and review service-area claim language.
