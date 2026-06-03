# Pumpkin Ice Local Visual QA Report

Date: 2026-06-03

Site: IceSkatingRinkRentals.com

Branch: `feature/admin-page-editor-import-export`

Scope: local preview QA readiness for the repaired homepage and contact page. This was a non-mutating pass: no CMS writes, no imports, no Theme or MediaAsset writes, no static generation, no deployment, no provider/DNS/email changes, and no Roller work.

## Start State

`git status --short` at start:

```text
 M apps/ice-rink-web/src/data/fallback-theme.ts
 M tools/import-preflight/import-preflight.mjs
```

Latest commits:

```text
100451a Add Ice PPEC visual brand repair
a522e7c Add approved Ice homepage local draft import report
9261c43 Bind approved PPEC logo MediaAsset
3cc5202 Convert approved Ice homepage Phase 8K to Phase 10A candidate
89ca42e Add Ice approved homepage conversion missing input report
efcdb24 Add Ice page import change sources
48d72e7 Add Ice PPEC home contact local draft import report
db5cb73 Repair Ice PPEC home contact candidates
f853b44 Add Ice updated home contact post repair reimport report
4dc63e7 Repair updated Ice home contact contract persistence
2c0b20c Add Ice updated home contact local draft import report
7206de9 Add admin auth diagnostic tooling
```

## Local Service Status

| URL | Status | Response length | Result |
| --- | ---: | ---: | --- |
| `http://localhost:5064` | 200 | 55 | Local API reachable |
| `http://localhost:3002` | 200 | 34131 | Local frontend reachable |

## Route Probes

| URL | Purpose | Status | Response length | Expected result |
| --- | --- | ---: | ---: | --- |
| `http://localhost:3002/__preview/ice-rink-rentals/home` | Local draft homepage preview | 200 | 28660 | Expected client preview shell |
| `http://localhost:3002/contact` | Local contact page | 200 | 48799 | Expected contact page response |
| `http://localhost:3002/service-areas` | Out-of-scope unchanged route check | 404 | n/a | Expected unchanged/404 |

Public `/` was not used to judge the draft homepage.

## Homepage Marker Results

The preview route returned a reachable client shell. Because the draft payload is loaded client-side, manual browser review requires the local admin JWT in the browser session. The JWT was not printed or stored in this report.

Readback artifact used for persisted draft markers:
`content-review/ice-ppec-visual-brand-repair/homepage-readback-after-ppec-visual-repair.json`

| Marker | Result |
| --- | --- |
| `Party Pros East Coast` | Pass |
| PPEC partner section/callout | Pass |
| PPEC logo MediaAsset ID `ice-rink-rentals-ppec-wordmark-card-d28c10b570d1` | Pass |
| PPEC copy/CTA | Pass |
| `contact@iceskatingrinkrentals.com` metadata | Pass |
| `publicEmailDisplayPolicy` includes `form-first-under-review` | Pass |
| No `contactus@` references | Pass |
| Official homepage MediaAsset IDs present | Pass |
| Production-render fields/variants present | Pass |

Observed production-render variants: `heroMedia`, `trustBand`, `mediaUseCaseGrid`, `processSteps`, `planningTopics`, `splitFeature`, `serviceAreaTeaser`, `ppecPartnerBand`, `faqAccordion`, `quote-form-panel`, `finalCta`.

PPEC verification status: ready for user visual approval in the local browser.

## Contact Marker Results

Route checked: `http://localhost:3002/contact`

Readback artifact used for persisted contact markers:
`content-review/ice-ppec-home-contact-local-draft-import/contact-readback-after-ppec-import.json`

| Marker | Result |
| --- | --- |
| HTTP 200 | Pass |
| Contact content appears available | Pass |
| Form/default quote marker detectable | Pass |
| Raw CF7 runtime marker in route HTML | Pass, not detected |
| No `contactus@` references | Pass |
| `formBlock` and `quote-form-panel` exist in readback | Pass |
| `contact@iceskatingrinkrentals.com` selected mailbox persists | Pass |
| `publicEmailDisplayPolicy` includes `form-first-under-review` | Pass |

Contact readiness status: ready for user visual approval.

## Manual Review Instructions

Use these exact URLs:
- Homepage draft preview: `http://localhost:3002/__preview/ice-rink-rentals/home`
- Contact: `http://localhost:3002/contact`
- Service areas unchanged check: `http://localhost:3002/service-areas`

Homepage manual review must use the preview route, not public `/`. If the preview route shows only the client shell, load the local admin JWT in the browser session and refresh the preview route. Do not paste or capture the JWT in reports, logs, screenshots, or notes.

Manual checklist:
- Homepage hero layout, images, PPEC section color/style, logo visibility, CTA wording/link behavior, mobile layout, CTA spacing, stray text/numbers, footer/nav, email visibility, and contact CTA behavior.
- Contact form layout, labels, submit CTA, mobile layout, PPEC/support callout if present, broken styling, public email visibility, and absence of raw CF7 runtime behavior.
- `/service-areas` remains unchanged or 404.

## Output Files

- `content-review/ice-local-visual-qa/README.md`
- `content-review/ice-local-visual-qa/ROUTE_PROBE_RESULTS.md`
- `content-review/ice-local-visual-qa/HOMEPAGE_PREVIEW_MARKERS.md`
- `content-review/ice-local-visual-qa/CONTACT_PREVIEW_MARKERS.md`
- `content-review/ice-local-visual-qa/MANUAL_VISUAL_QA_CHECKLIST.md`
- `content-review/ice-local-visual-qa/REMAINING_VISUAL_REVIEW_ITEMS.md`
- `content-review/ice-local-visual-qa/manifest.json`

## Hygiene Checks

Results:
- Manifest JSON parse: pass.
- `git diff --check`: pass.
- Trailing whitespace scan: pass.
- Protected/generated/raw artifact path check: pass.
- Targeted secret scan: pass.
- CMS writes/imports: none.
- Static generation: none.
- Deployment/provider/DNS/email changes: none.
- Theme writes: none.
- MediaAsset writes: none.
- Roller work: none.

Readiness:
- Homepage: ready for user visual approval, with manual JWT browser loading if the shell does not hydrate draft content automatically.
- Contact: ready for user visual approval.
- Service areas: unchanged/404 as expected.

Next recommended action: user visual approval in the local browser using the documented URLs.

