# Pumpkin Tenant Website Publish Readiness V2.8.60R Airstrip Responsive Repair Report

Status: completed.

Lane: V2.8 Tenant Website / Pumpkin Live Platform Readiness.

Classification: `airstrip_mobile_responsive_layout_repair_production_default_host_proof_no_dns_no_indexing`.

## Summary

V2.8.60R repaired the Airstrip mobile/tablet overflow issue before Bluehost DNS/custom-domain binding resumed.

The fix is durable and repeatable through:

- `deployment/airstrip/patches/v2-8-60r-mobile-responsive/README.md`
- `deployment/airstrip/patches/v2-8-60r-mobile-responsive/apply-overlay.mjs`
- `deployment/airstrip/patches/v2-8-60r-mobile-responsive/overlays/apps/airstrip-frontend/src/app/v2-8-60r-responsive.css`

The original ZIP and normalized package were not modified. The overlay was applied only to copied `.tmp` workspaces for build and deployment.

## V2.8.60 Carryforward

V2.8.60 had already made the Airstrip production default host live:

- `https://app-airstrip-prod-centralus-001.azurewebsites.net`

Bluehost DNS and custom-domain binding remained owner-action-required and paused.

## Issue Reproduction

Before repair, production default-host mobile diagnostics reproduced horizontal overflow:

- Checks: 20 mobile route/viewport combinations.
- Overflow failures: 13.
- HTTP non-200: 0.
- Console errors: 0.
- Failed requests: 0.
- Missing images: 0.

Primary offender: `.as-nav-right` rendered full desktop nav links and CTA on mobile, expanding to approximately 673 px and pushing the page wider than the viewport.

## Root Cause

The active Next stylesheet, `apps/airstrip-frontend/src/app/globals.css`, included the Airstrip header classes but did not carry over the mobile nav collapse rules that existed in the static `public/assets/css/site.css` source. The React header therefore kept desktop links and the Request Booking CTA visible on mobile.

Additional responsive risk was found in fixed or minimum-width grids and large headings, including `.as-why-grid`, package grids, group grids, and hero/page headings.

## Repair

The overlay restores mobile/tablet header containment and adds scoped responsive constraints:

- Collapse desktop nav links and CTA behind the hamburger at tablet/mobile widths.
- Contain mobile menu width to the viewport.
- Preserve visible/tappable Request Booking CTA inside the mobile menu.
- Constrain hero and page headings with responsive `clamp()` sizing.
- Collapse fixed-column grids on mobile and high-risk tablet widths.
- Add box sizing and media max-width containment.

No business copy, prices, package data, form fields, media assets, secrets, environment config, DNS, custom domains, indexing, or CMS records were changed.

## Build And Deploy

Local validation:

- `npm ci`: passed with existing dependency audit/deprecation warnings.
- `npm run type-check`: passed.
- `npm run build`: passed.
- Local standalone route smoke: passed.
- Local responsive proof: 28/28 route/viewport checks passed.

Deployment artifact:

- Ignored `.tmp` artifact: `.tmp/v2-8-60r/artifacts/airstrip-responsive-v2-8-60r-posix.zip`.
- Bytes: 10,152,228.
- Entries: 1,923.
- Backslash ZIP entries: 0.
- Root `server.js`: present.
- `.next/static`: present.
- Public assets: present.
- Protected config entries: 0.

Isolated deploy:

- Target: `app-airstrip-preview-isolated-centralus-001`.
- Deployment count: 1.
- Deployment ID: `501c3af3-2949-49bf-9a38-35c48a32615f`.
- Result: `RuntimeSuccessful`.
- Isolated responsive proof: 28/28 route/viewport checks passed.

Production deploy:

- Target: `app-airstrip-prod-centralus-001`.
- Deployment count: 1.
- Deployment ID: `ea8652db-9f73-47b9-bbfa-a92ce3c43da9`.
- Result: `RuntimeSuccessful`.
- Production responsive proof: 28/28 route/viewport checks passed.

## Production Visual Proof

Production default-host browser proof after repair:

- Routes: `/`, `/request-booking`, `/packages`, `/airstrip-the-club`.
- Viewports: 360x800, 375x812, 390x844, 414x896, 430x932, 768x1024, 1440x1200.
- Total checks: 28.
- Horizontal overflow: 0.
- HTTP non-200: 0.
- Console errors: 0.
- Failed requests: 0.
- HTTP 4xx/5xx browser responses: 0.
- Missing image cases: 0.
- Clipped H1 cases: 0.

Visual artifacts are outside the repo at:

- `C:\Users\User\Desktop\PumpkinCMS\visual-review\v2-8-60r-airstrip-responsive-repair\`

After screenshot checksums:

| File | SHA-256 |
| --- | --- |
| `airstrip-production-home-mobile-after.png` | `c1c665d5649ab7e35f25ca30afecdada0ac8f71bca84de9198b24463d08eb07d` |
| `airstrip-production-request-booking-mobile-after.png` | `78e11fe69239a5b5ea3f7fea1ec7543f7203939ae1f345ea153d70ddfee391a8` |
| `airstrip-production-home-desktop-after.png` | `579f3b7d7701b2b8a9e6dc96b98895cb4ad9980fbee1c40391350267289968be` |

## Ice No-Regression

GET-only Ice/platform no-regression passed:

- Ice apex/www `/`, `/contact`, `/service-areas`: HTTP 200.
- Ice apex/www `/api/static-contact-health`: HTTP 200.
- Ice isolated `/api/static-contact-health`: HTTP 200.
- Pumpkin API `/health` and `/api/health`: HTTP 200.
- Admin UI production `/`, `/login`, `/dashboard`: HTTP 200.
- Airstrip production default host required routes: HTTP 200.

## V2.8.61 Readiness

V2.8.61 Bluehost DNS/custom-domain binding may resume after owner approval because the Airstrip production default host is now mobile-correct and desktop-correct.

DNS remains paused in this phase. No Bluehost DNS, custom-domain binding, nameserver, Azure DNS, Google Workspace email DNS, CDN, Front Door, or indexing action occurred.

## Cleanup

- `.tmp/v2-8-60r/` was deleted after successful closeout.
- The local standalone server was stopped.
- The original ZIP and normalized package were retained and unmodified.
- Visual screenshots remain outside the repo.
- No screenshots, browser artifacts, generated deployment artifacts, or `.tmp` files were staged.

## Files

Result package:

- `deployment/architecture/tenant-website-publish-readiness/v2-8-60r-airstrip-responsive-repair-result/`

Durable platform docs:

- `deployment/architecture/pumpkin-platform/PUMPKIN_AIRSTRIP_RESPONSIVE_REPAIR_V2_8_60R.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_AIRSTRIP_PRODUCTION_VISUAL_PROOF_V2_8_60R.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_AIRSTRIP_DNS_BINDING_READINESS_V2_8_60R.md`

Next approval is folded into:

- `deployment/architecture/tenant-website-publish-readiness/v2-8-60r-airstrip-responsive-repair-result/next-phase-prompt.md`
