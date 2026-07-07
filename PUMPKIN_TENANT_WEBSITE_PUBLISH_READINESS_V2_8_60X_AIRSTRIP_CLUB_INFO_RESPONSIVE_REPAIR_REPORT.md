# Pumpkin Tenant Website Publish Readiness V2.8.60X Airstrip Club Info Responsive Repair Report

Date: 2026-07-06

## Phase Status

Status: `completed_airstrip_club_info_responsive_repair_replayed_and_deployed`

Lane: V2.8 Tenant Website / Pumpkin Live Platform Readiness

Classification: `airstrip_club_info_responsive_repair_replay_proof_no_dns_no_custom_domain`

V2.8.60X repaired the Airstrip production default-host `/airstrip-the-club` mobile overflow blocker found by V2.8.60V, replayed local, isolated, and production responsive proof, and kept DNS/custom-domain/indexing/contact/form/content/media boundaries closed.

## Carryforward

- V2.8.60V added responsive guardrails and found 5 mobile overflow failures on `/airstrip-the-club`.
- V2.8.60R provided the durable base mobile overlay at `deployment/airstrip/patches/v2-8-60r-mobile-responsive/`.
- V2.8.60WD documented the Spectre Dev SuperAdmin rotation; no password or hardcopy content was read, printed, or staged in this phase.

## Before Reproduction

Production default host before repair:

- URL: `https://app-airstrip-prod-centralus-001.azurewebsites.net`
- Tool: `deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/tools/check-responsive-output.mjs`
- Routes: `/`, `/request-booking`, `/packages`, `/airstrip-the-club`
- Viewports: 360x800, 375x812, 390x844, 414x896, 430x932, 768x1024, 1440x1200
- Result: `valid=false`
- Overflow failures: 5, all on `/airstrip-the-club`
- Console errors, failed requests, bad responses, missing images, navigation failures: 0

Failure widths:

| Route | Viewport | Scroll width | Overflow |
| --- | ---: | ---: | ---: |
| `/airstrip-the-club` | 360x800 | 400 | 40 |
| `/airstrip-the-club` | 375x812 | 410 | 35 |
| `/airstrip-the-club` | 390x844 | 420 | 30 |
| `/airstrip-the-club` | 414x896 | 436 | 22 |
| `/airstrip-the-club` | 430x932 | 447 | 17 |

## Root Cause

Source inspection found the club page visit/info grid and adjacent club-page card grids were not fully mobile-contained:

- `.as-club-info-grid` used `grid-template-columns: repeat(4, 1fr)` with gaps and no mobile collapse.
- `.as-club-grid` and `.as-amen-grid` also kept multi-column cards at small widths.
- Uppercase headings inside narrow club cards could keep the body scroll width wider than the viewport.

The fix is layout-only and does not change business copy, packages, pricing, forms, phone numbers, media, environment configuration, or CMS content.

## Overlay

Created durable overlay:

- `deployment/airstrip/patches/v2-8-60x-club-info-responsive/README.md`
- `deployment/airstrip/patches/v2-8-60x-club-info-responsive/apply-overlay.mjs`
- `deployment/airstrip/patches/v2-8-60x-club-info-responsive/overlays/apps/airstrip-frontend/src/app/v2-8-60x-club-info-responsive.css`

The overlay is applied after V2.8.60R and appends stable V2.8.60X markers to copied-workspace `globals.css`.

## Build And Deploy

Local build:

- `npm ci`: passed with existing audit/deprecation warnings.
- `npm run type-check`: passed.
- `npm run build`: passed.
- Local standalone route smoke: 4/4 HTTP 200.
- Local responsive replay: 28/28 valid, 0 overflow.

Artifact:

- ZIP: `.tmp/v2-8-60x/artifacts/airstrip-v2-8-60x-posix.zip`
- SHA-256: `8ece6bfc0670755ad6c33b3ad0da7c5182075563edad1b9fa49ab22e26be9cf4`
- Bytes: 10,152,557
- Entries: 1,925
- Backslash entries: 0
- Root `server.js`: present
- Protected config entries: 0

Deployments:

- Isolated preview deploy count: 1
- Isolated deployment ID: `f08a69c0-9e7a-428d-8d84-6ace3fd6d701`
- Isolated status: `RuntimeSuccessful`
- Production default-host deploy count: 1
- Production deployment ID: `dfc54ec4-ea78-4358-9567-a3badc9e98fe`
- Production status: `RuntimeSuccessful`

## Replay Proof

| Stage | Valid | Checks | Overflow | Console | Failed requests | Bad responses | Missing images |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Before production | false | 28 | 5 | 0 | 0 | 0 | 0 |
| Local after repair | true | 28 | 0 | 0 | 0 | 0 | 0 |
| Isolated after deploy | true | 28 | 0 | 0 | 0 | 0 | 0 |
| Production after deploy | true | 28 | 0 | 0 | 0 | 0 | 0 |

Production `/airstrip-the-club` has zero mobile overflow on the required mobile widths.

## Visual Artifacts

Outside-repo folder:

`C:\Users\User\Desktop\PumpkinCMS\visual-review\v2-8-60x-airstrip-club-info-responsive-repair\`

Screenshot checksums:

- `92fd41e05b10418ea39e42b22288c1905ae3eeacf88f805c9b4576c040b3e2f7  airstrip-production-club-mobile-after.png`
- `5551f7a6abd8ca7de442cdf102eec5d2545d315c1db456a5d099b2b3f638612f  airstrip-production-home-mobile-after.png`

## No-Regression

GET-only runtime no-regression passed: 17/17 HTTP 200.

- Ice apex/www `/`, `/contact`, `/service-areas`, `/api/static-contact-health`: HTTP 200.
- Pumpkin API `/health`, `/api/health`: HTTP 200.
- Admin UI production `/`, `/login`, `/dashboard`: HTTP 200.
- Airstrip production default host `/`, `/request-booking`, `/packages`, `/airstrip-the-club`: HTTP 200.

## Security Boundary

Confirmed:

- No Bluehost DNS mutation.
- No custom-domain binding.
- No nameserver change.
- No Azure DNS zone creation.
- No Google Workspace email DNS activation.
- No CDN/Front Door.
- No search indexing action.
- No contact POST.
- No form submission.
- No customer-facing POST proof.
- No media upload/delete.
- No Airstrip/Ice CMS content mutation.
- No user/role/tenant/DomainBinding/appsetting mutation.
- No storage keys/listKeys.
- No SAS generation.
- No connection string generation.
- No Key Vault secret query.
- No hardcopy content read.
- No screenshot staging.
- No `.tmp` staging.

## Cleanup State

After validation, `.tmp/v2-8-60x` was removed. The outside-repo visual review folder was retained:

`C:\Users\User\Desktop\PumpkinCMS\visual-review\v2-8-60x-airstrip-club-info-responsive-repair\`

## Files Created Or Modified

- `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_60X_AIRSTRIP_CLUB_INFO_RESPONSIVE_REPAIR_REPORT.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-60x-airstrip-club-info-responsive-result/`
- `deployment/architecture/pumpkin-platform/PUMPKIN_AIRSTRIP_CLUB_INFO_RESPONSIVE_REPAIR_V2_8_60X.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_AIRSTRIP_PACKAGE_INTAKE_BENCHMARK_V2_8_60X.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_AIRSTRIP_PRE_DOMAIN_CUTOVER_READINESS_V2_8_60X.md`
- `deployment/airstrip/patches/v2-8-60x-club-info-responsive/`

## Next Approval

The next approval prompt is folded into:

`deployment/architecture/tenant-website-publish-readiness/v2-8-60x-airstrip-club-info-responsive-result/next-phase-prompt.md`

## Exact-Path Commit Instructions

Do not use `git add -A`.

```powershell
git add -- `
  "PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_60X_AIRSTRIP_CLUB_INFO_RESPONSIVE_REPAIR_REPORT.md" `
  "deployment/architecture/tenant-website-publish-readiness/v2-8-60x-airstrip-club-info-responsive-result/" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_AIRSTRIP_CLUB_INFO_RESPONSIVE_REPAIR_V2_8_60X.md" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_AIRSTRIP_PACKAGE_INTAKE_BENCHMARK_V2_8_60X.md" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_AIRSTRIP_PRE_DOMAIN_CUTOVER_READINESS_V2_8_60X.md" `
  "deployment/airstrip/patches/v2-8-60x-club-info-responsive/"

git diff --cached --check
git commit -m "Add V2.8.60X Airstrip responsive repair"
```
