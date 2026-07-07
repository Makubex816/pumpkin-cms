# V2.8.61C Package Intake Analyze Report

Status: completed.

Lane: V2.8 Tenant Website / Pumpkin Live Platform Readiness.

Classification: `universal_package_intake_upload_quarantine_analyze_no_live_mutation_no_post`.

Tenant benchmark: `airstrip-club-las-vegas`.

Completed at: `2026-07-06T21:34:14-04:00`.

## V2.8.61B Carryforward

- V2.8.61B restore dry-run passed with documented gaps.
- Backup bundle integrity, database restore planning, media restore planning, website restore planning, and restore ordering were proven locally.
- No live restore was performed.
- Airstrip production default-host runtime remained healthy.

## Intake Analyzer Result

Implemented reusable local CLI:

`deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/tools/intake-analyze-package.mjs`

CLI shape:

`node intake-analyze-package.mjs --zip <zipPath> --out <outputDir> --tenant-id <tenantId>`

The analyzer:

- extracts ZIP contents to ignored `.tmp/v2-8-61c/quarantine`;
- cleans quarantine by default unless `--keep-temp` is supplied;
- inventories files, directories, sizes, extensions, package metadata, and protected config filenames;
- detects framework/tooling candidates;
- discovers routes, media, form flows, and theme/brand hints;
- classifies rendering mode;
- writes machine-readable analysis and source-map output;
- writes a non-technical owner action packet.

No package install, package build, uploaded script execution, deploy, tenant creation, import, media upload, form/contact POST, or live mutation occurred.

## Airstrip Replay

Outside-repo proof output:

`C:\Users\User\Desktop\PumpkinCMS\tenant-onboarding-intake\TRUENewestTenant\v2-8-61c-intake-analysis-proof`

Replay summary:

- ZIP SHA-256: `3bf93c6b016eb2aa0caa802cc52b0f9ef133aa9fae44ad59bc06be70b6f579f0`.
- Files inventoried: 355.
- Directories inventoried: 57.
- Framework: Next.js.
- Confidence: high.
- Rendering mode candidate: `hybrid_next_server_required`.
- Routes discovered: 25.
- Dynamic routes: 1.
- Media candidates: 13.
- Form candidates: 54.
- Primary form candidate: `apps/airstrip-frontend/src/app/request-booking/page.tsx`.
- Candidate FormDefinition: `airstrip-reservation`.
- Protected config filename findings: 2.
- Protected config contents read: false.

Important proof hashes:

- `intake-analysis.json`: `C1BE4E196A7A7653E52303CBFB1518620F3BCA0B21D5FBAF91B14C1CCB313003`
- `source-map.json`: `F85405A5CF0F99DE94560CB34D0C06F415E107E9E2C339A5EA56B2760BF75EBC`
- `OWNER_ACTION_PACKET.md`: `D3A66E9D44B30F426782D607AF70366689B473F58CFB1B6672195115AB1EBA25`

## Benchmark State

Airstrip raw ZIP is a real-world upload benchmark, not a perfect package. It is detected as a Next.js App Router package that likely needs hybrid runtime/build proof. The V2.8.60R and V2.8.60X overlays remain the passing benchmark for repaired mobile responsive output.

Mobile responsive QA remains mandatory before isolated preview, production deploy, custom-domain cutover, contact POST, form submission, or customer-facing POST proof.

## Runtime No-Regression

GET-only runtime no-regression passed 17/17 with HTTP 200 across Ice, Pumpkin API, Admin UI, and Airstrip default-host routes.

## Next Phase

The V2.8.61D compiler readiness prompt is folded into:

`deployment/architecture/tenant-website-publish-readiness/v2-8-61c-package-intake-analyze-result/next-phase-prompt.md`
