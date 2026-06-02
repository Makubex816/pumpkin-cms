# Pumpkin Ice Homepage Phase 8N Local Draft Overwrite Report

Created: 2026-06-02T21:58:25.899Z

Updated: 2026-06-02T18:10:39.9257683-04:00

## Scope

Primary focus: IceSkatingRinkRentals.com. RollerRinkRentals.com remains paused.

Authorized action from the prior run: overwrite the local CMS homepage draft for route `/` only with the Phase 8N normalized homepage candidate.

This patch run did not perform the homepage overwrite. It only corrected the untouched-route guard documentation and added a reusable non-mutating helper so `/service-areas` HTTP 404 is accepted as an expected unchanged baseline for the next homepage-only retry.

No `/`, `/contact`, `/service-areas`, Theme, MediaAsset, static generation, deployment, DNS, email/provider, protected config, or Roller action was performed in this patch run.

## Start State

Git status at the original overwrite attempt was clean. At the start of this patch run, the prior Phase 8N overwrite blocker docs were uncommitted, and `content-review/ice-homepage-phase8n-crm-scaffold-validated/phase8n-import-preflight-result.json` was modified from the prior validation rerun.

Recent log:

```text
e2d150b Add Ice homepage Phase 8N scaffold validation package
e465511 Add Ice homepage draft preview and production rendering support
631c899 Add Ice homepage render diagnostic report
c60217f Add Ice contact local draft import report
2d8bb45 Add Ice homepage local draft import report
892dccb Add Ice homepage local draft import auth blocker report
9b7bcad Add Ice homepage business contact policy package
dfe4f90 Bind Ice homepage MediaAsset records
faf5986 Add Ice homepage MediaAsset binding blocker report
895f914 Add safe local homepage import preflight runner
c6e6382 Add Ice homepage local CMS preview readiness report
0b7345f Add Ice local preview readiness package
```

Selected candidate: `content-review/ice-homepage-phase8n-crm-scaffold-validated/HOMEPAGE_PHASE8N_NORMALIZED_CANDIDATE.json`

## Prior Authenticated Attempt

- API reachability: reachable, HTTP 200
- Admin auth status: VALID
- Temp JWT deleted after loading: yes
- JWT printed: no
- Current homepage snapshot saved: `content-review/ice-homepage-phase8n-local-draft-overwrite/current-homepage-before-phase8n.snapshot.json`
- Overwrite performed: no

The prior run stopped before CMS write because its one-off pre-write guard treated `/service-areas` HTTP 404 as unsafe. That was overly strict for the current Ice project state because `/service-areas` has not been imported yet.

Corrected interpretation: `/service-areas` HTTP 404 is an accepted `expected-not-found` baseline for this homepage-only overwrite. It must be captured before the overwrite and verified unchanged afterward, including still 404 if that was the baseline.

## Validation Results From Prior Attempt

- jsonParse: passed
- dotnetPageContract: passed-with-review-only-warnings
- dotnetPackageContract: passed-with-review-only-warnings
- safeImportPreflight: passed-for-shape-and-local-draft
- productionRendererCompatibility: passed
- designSystem: passed
- media: passed-with-existing-warning-class
- defaultForm: passed-with-homepage-no-formBlock-warning
- tailwindNavigation: passed
- pageIntakeNormalizer: passed
- unsafeScan: passed
- routeCanonicalAudit: passed
- targetedSecretScan: passed

Safe import preflight output: `content-review/ice-homepage-phase8n-crm-scaffold-validated/phase8n-import-preflight-result.json`

## Pre-Import Homepage State

```json
{
  "found": true,
  "id": "ice-rink-rentals-home",
  "pageId": "ice-rink-rentals-home",
  "tenantId": "ice-rink-rentals",
  "pageSlug": "home",
  "pageVersion": 10,
  "isPublished": false,
  "includeInSitemap": false,
  "workflowStatus": "draft",
  "reviewStatus": "needs_review",
  "approvedForPublish": false,
  "productionApproved": null,
  "publishApproved": null,
  "staticNeedsRebuild": true,
  "staticEligible": false,
  "revisionNumber": 6,
  "currentRevisionId": "ice-rink-rentals-home:rev-6",
  "rollbackAvailable": true,
  "blockCount": 10,
  "blockTypes": [
    "Hero",
    "TrustBar",
    "CardGrid",
    "customHtml",
    "HowItWorks",
    "customHtml",
    "customHtml",
    "FAQ",
    "formBlock",
    "PrimaryCTA"
  ],
  "variants": [
    "split-feature",
    "event-card-grid",
    "split-feature"
  ],
  "mediaAssetIds": [
    "ice-rink-rentals-default"
  ],
  "selectedMailbox": "",
  "publicEmailDisplayPolicy": "",
  "publicContactEmail": ""
}
```

## Corrected Guard Behavior

Helper added:

`tools/phase8n-homepage-overwrite/untouched-route-guard.mjs`

Rules:

- `/contact`: must be HTTP 200 before overwrite and must match after overwrite.
- `/service-areas`: may be HTTP 200 or HTTP 404 before overwrite.
- `/service-areas` HTTP 404 is classified as `expected-not-found`.
- `/service-areas` HTTP 404 must not block a homepage-only draft overwrite.
- Unexpected transport/API failures still block.
- After overwrite, `/service-areas` must match the captured baseline. If the baseline was 404, the after state must still be 404.

This helper is non-mutating, does not require admin JWT, does not read protected config, and does not call CMS write APIs.

## Overwrite Result

Overwrite performed: no

Endpoint/tool used: `not-used`

Current status: the guard blocker has been corrected, but the homepage overwrite still has not been performed. A fresh temp JWT is required for a separate retry because the prior JWT was deleted after successful validation.

## Readback Verification

Readback was not performed because no CMS write occurred.

Production renderer compatibility, MediaAsset binding verification, and public email/contact policy verification were validated before the prior import attempt, but post-import readback is still pending until a separate authorized overwrite retry succeeds.

## Untouched Verification

- `/contact` changed by this patch run: no
- `/service-areas` changed by this patch run: no
- Theme changed by this patch run: no
- MediaAsset records changed: no
- Static regeneration: no
- Deployment/DNS/email/provider action: no
- Protected config touched: no
- Roller advanced: no

Corrected untouched-route rule: `/service-areas` 404 is accepted as an unchanged baseline for the homepage-only overwrite path.

## Checks Run

- git status --short --untracked-files=all
- git log --oneline -12
- reviewed Phase 8N overwrite report/output folder
- reviewed import preflight helper
- added non-mutating untouched-route guard helper
- node --check for changed `.mjs` helper
- helper self-test for `/service-areas` 404 baseline
- JSON parse validation for changed JSON files
- git diff --check
- trailing whitespace scan
- protected config/workflow/generated-folder check
- targeted secret scan
- no ZIPs staged
- no raw media staged
- no extracted input folders staged
- no generated static folders staged

## Remaining Blockers

Before local draft overwrite retry:

- Save a fresh valid JWT to `$env:TEMP\pumpkin-admin-jwt.txt`.
- Use the corrected untouched-route guard behavior in the retry.
- Capture `/contact` before overwrite and verify it unchanged after overwrite.
- Capture `/service-areas` before overwrite and verify it unchanged after overwrite; HTTP 404 is valid if it remains 404.
- Perform homepage readback and revision/rollback verification after a successful write.

Before static regeneration:

- Complete the local homepage draft overwrite and readback verification.
- Manual browser preview review is required.
- Static regeneration must be separately authorized.
- `staticPublishing.staticEligible` remains false.

Before production/indexing:

- Production approval and publish approval are still false.
- Final public contact policy and phone/email display decision remain under review.
- Deployment and indexing must be separately authorized.

## Expected Decision State

- Ready for corrected homepage overwrite retry: yes, after a fresh valid JWT is provided.
- Ready for real CMS write from this patch run: no; this patch intentionally performed no write.
- Ready for static regeneration: no.
- Ready for production/indexing: no.

## Next Recommended Action

When a separate overwrite retry is authorized, rerun the homepage-only local draft overwrite with a fresh temp JWT and the corrected untouched-route guard. The retry should not block solely because `/service-areas` returns HTTP 404.
