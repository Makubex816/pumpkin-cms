# Pumpkin Page Quality Warning Triage - Phase 7A Report

## Summary

Phase 7A reviewed the fresh static dry-run package `2026-05-21-1605` and categorized the remaining page-quality/content warnings for Ice and Roller.

No static packages were regenerated. No generated output folders were modified. No protected config files were read or modified. No Azure resources were created. No Azure deployment, Cloudflare change, DNS change, email send, production page creation, provider/state research, hard delete, active workflow, or static package upload occurred.

## Starting State

- `git status --short` was clean at the start.
- Reviewed dry-run folder: `.static-release-dry-runs/2026-05-21-1605`
- Reviewed manifest: `.static-release-dry-runs/2026-05-21-1605/static-publish-dry-run-manifest.json`
- Reviewed summary: `.static-release-dry-runs/2026-05-21-1605/STATIC_PUBLISH_DRY_RUN_SUMMARY.md`
- Static package status from Phase 6Z: both sites validate and are marked `readyForManualUpload: true`.

## Package Readiness Snapshot

Ice:

- site key: `ice-rink-rentals`
- upload root: `.static-release-dry-runs/2026-05-21-1605/ice-rink-rentals`
- file count: 48
- source validator: passed
- release validator: passed
- canonical sitemap check: passed
- secret scan: passed
- redirect records: 1
- page-quality warnings: 40
- ready for manual upload: yes

Roller:

- site key: `roller-rink-rentals`
- upload root: `.static-release-dry-runs/2026-05-21-1605/roller-rink-rentals`
- file count: 42
- source validator: passed
- release validator: passed
- canonical sitemap check: passed
- secret scan: passed
- redirect records: 0
- page-quality warnings: 30
- ready for manual upload: yes

## Ice Warning Triage

Total page-quality warnings: 40

Affected pages/routes:

- `home` -> `/`: 5 warnings
- `contact` -> `/contact`: 7 warnings
- `ice-rink-rentals` -> `/ice-rink-rentals`: 9 warnings
- `events-holiday-activations` -> `/events-holiday-activations`: 9 warnings
- `phase-3-duplicate-test-51412237` -> `/phase-3-duplicate-test-51412237`: 5 warnings
- `phase-6d-redirect-test` -> `/phase-6d-redirect-test`: 5 warnings

Warning categories:

| Category | Count | Affected pages | Production severity |
| --- | ---: | --- | --- |
| Workflow approval/status missing | 12 | all 6 pages | production blocker until intentionally approved |
| Static publishing metadata/stale rebuild | 12 | all 6 pages | staging note; production workflow blocker if not reconciled |
| Fulfillment disclosure missing | 6 | all 6 pages | production blocker for non-direct fulfillment |
| Service schema/products missing | 6 | `/ice-rink-rentals`, `/events-holiday-activations` | SEO/content readiness blocker for service pages |
| Form/lead routing missing | 4 | `/contact`, `/ice-rink-rentals`, `/events-holiday-activations` | production lead-capture blocker where forms/CTAs are expected |

Content scan notes:

- Ice has one content-scan warning for a possible localhost reference in the generated Next.js polyfills chunk.
- This appears separate from page content and should be spot-checked before upload, but it does not currently fail the static validators.

## Roller Warning Triage

Total page-quality warnings: 30

Affected pages/routes:

- `home` -> `/`: 9 warnings
- `contact` -> `/contact`: 12 warnings
- `roller-rink-rentals` -> `/roller-rink-rentals`: 9 warnings

Warning categories:

| Category | Count | Affected pages | Production severity |
| --- | ---: | --- | --- |
| Workflow approval/status missing | 6 | all 3 pages | production blocker until intentionally approved |
| Revision/rollback readiness missing | 6 | all 3 pages | operational readiness blocker before serious content editing |
| Static publishing metadata/stale rebuild | 6 | all 3 pages | staging note; production workflow blocker if not reconciled |
| Template identity missing | 3 | all 3 pages | content contract/readiness blocker |
| Fulfillment status missing | 3 | all 3 pages | production blocker |
| Form/lead routing missing | 6 | all 3 pages, strongest on `/contact` | production lead-capture blocker |

Content scan notes:

- Roller has content-scan warnings for visible local-proof copy in generated pages.
- Roller has localhost-reference warnings in generated page outputs and the generated Next.js polyfills chunk.
- The local-proof copy is production-blocking. It is acceptable for a staging proof package only if staging is clearly treated as a technical validation environment.

## Cosmetic / Content-Quality Only

These are not runtime build failures and can be reviewed during staging:

- service schema details missing on Ice service-like pages, as long as structured-data output remains conservative
- static publishing `needsRebuild` flags after a freshly generated local package, as long as operators understand the CMS metadata has not been marked deployed
- possible localhost reference in the generated polyfills chunk, if confirmed to be framework/polyfill code rather than a user-facing link
- revision/rollback readiness warnings for Roller, if no production content editing will happen before the next repair pass

## Production Cutover Blockers

These should block production cutover:

- Roller local-proof copy in public page content
- any true user-facing localhost references
- workflow approval/status missing on published pages
- pages not marked `staticPublishing.staticEligible` when intended for static production
- `staticPublishing.needsRebuild` still true without an operator decision after the final production package
- missing fulfillment status or missing public disclosure for non-direct fulfillment
- contact/form pages missing `formConfig.domainRoutingKey` or `formConfig.staticFormEndpointKey`
- service/CTA pages missing `formConfig.conversionGoal` when lead capture is expected
- service-like pages missing `serviceSchema.serviceName`, `serviceSchema.serviceType`, or `serviceSchema.productsOffered`
- Roller pages missing `template.templateKey`

## Recommended Fix Order

1. Remove Roller local-proof copy and any visible localhost references from public content.
2. Set workflow status and approval metadata for pages intended to be public.
3. Decide static publishing eligibility and clear or document `needsRebuild` only after the final package is generated.
4. Complete fulfillment status and public disclosure fields.
5. Configure form/domain routing for contact and CTA pages, especially `domainRoutingKey`, `staticFormEndpointKey`, `formType`, and `conversionGoal`.
6. Populate service schema/products for service-like pages.
7. Add template identity metadata, especially for Roller pages.
8. Create revision/rollback snapshots for Roller pages through a safe edit/repair path.
9. Regenerate fresh static packages and rerun validators after repairs.

## Staging Readiness

Manual upload to an Azure Static Web Apps staging default host can proceed for technical validation if Timothy wants to test:

- static asset loading
- route rendering
- sitemap/robots behavior
- redirect artifact behavior
- static form endpoint wiring
- Lead Inbox receipt from staging forms

The staging test should be labeled as technical validation, not production approval. The warning list should travel with the staging handoff.

## Production Readiness

Production cutover should wait.

The static packages are technically valid, but content/workflow/form/fulfillment warnings are still too important for public production traffic. Roller in particular still contains local-proof copy and local-dev references that must be removed before production use.

## Checks Run

- `git status --short` at start - clean
- dry-run manifest review for `2026-05-21-1605` - completed
- dry-run summary review for `2026-05-21-1605` - completed
- page-quality warning categorization - completed
- content-scan warning spot check - completed
- generated static folders modified - no
- `node --check` for changed `.mjs` files - not applicable because Phase 7A changed no `.mjs` files
- `git diff --check` - passed
- direct trailing whitespace scan over this untracked report - passed
- protected config/workflow check for `.env.local`, `appsettings.Development.json`, and `.github/workflows` - passed with no changes reported
- targeted secret scan over this report - passed; findings were limited to the words `secret scan` in validator/check descriptions
- generated static folder staging check for `.static-artifacts`, `.static-content-snapshots`, `.static-release-dry-runs`, `.next`, and `node_modules` - passed with no changes reported

## Protected Files

Phase 7A did not read or modify:

- `apps/ice-rink-web/.env.local`
- `apps/pumpkin-api/appsettings.Development.json`

Phase 7A did not add or modify `.github/workflows`.

## Next Recommended Phase

Phase 7B should apply safe metadata/content repairs in the CMS/admin flow, starting with Roller local-proof copy, workflow approval metadata, form/static endpoint routing, fulfillment disclosure, and service schema fields. After repairs, generate a new fresh dry-run package and compare warning counts against this Phase 7A baseline.
