# Pumpkin Page Quality Repair Plan - Phase 7B Report

## Summary

Phase 7B maps the Phase 7A warning categories from dry-run `2026-05-21-1605` back to source content fields and safe repair paths. This is a planning-only phase: no CMS content was edited, no generated output was changed, and no static package was regenerated.

Staging default-host upload can still proceed for technical review. Production cutover should wait until the production-blocking items below are repaired in source content and a new dry-run package validates cleanly.

## Reviewed Sources

- `PUMPKIN_PAGE_QUALITY_TRIAGE_PHASE7A_REPORT.md`
- `.static-release-dry-runs/2026-05-21-1605/static-publish-dry-run-manifest.json`
- `.static-release-dry-runs/2026-05-21-1605/STATIC_PUBLISH_DRY_RUN_SUMMARY.md`
- `apps/ice-rink-web/scripts/snapshot-cms-content.mjs`
- `apps/ice-rink-web/scripts/static-publish.mjs`
- `apps/admin/src/lib/page-repairs.ts`
- `apps/admin/src/app/dashboard/pages/[id]/edit/page.tsx`
- current CMS snapshot page JSON under `apps/ice-rink-web/.static-content-snapshots/...`

Generated static output folders were reviewed only as inputs from the latest dry-run and were not modified.

## Source Of Truth

The fresh package used `cms-snapshot`, so the primary repair target is CMS Page data, updated through the existing admin editor, repair metadata tool, form builder, or intentional import package workflow.

Do not repair generated HTML, `.static-artifacts`, `.static-content-snapshots`, or `.static-release-dry-runs` directly. Those folders should be regenerated after source repairs.

## Ice Repair Matrix

| Warning category | Affected routes | Source field/data area | Recommended source repair | Safe automation | Manual review | Production priority |
| --- | --- | --- | --- | --- | --- | --- |
| Workflow approval/status | `/`, `/contact`, `/ice-rink-rentals`, `/events-holiday-activations`, `/phase-3-duplicate-test-51412237`, `/phase-6d-redirect-test` | `workflow.status`, `workflow.reviewStatus`, `workflow.approvedForPublish`, `workflow.approvedBy`, `workflow.approvedAt` | For pages intended to remain public, set `workflow.status` to `approved` or `published`, set `workflow.reviewStatus` to `approved`, and mark `approvedForPublish` true with reviewer/timestamp. For test pages, unpublish or remove from sitemap instead of approving. | No for approval itself. Metadata defaults can be prepared by repair tool, but approval is editorial. | Yes | Blocker |
| Static eligibility/stale rebuild | same 6 routes | `staticPublishing.staticEligible`, `staticPublishing.needsRebuild`, `staticPublishing.deploymentStatus`, content hash fields | Mark final public pages `staticEligible: true`. Keep `needsRebuild: true` until after final repair and package generation; clear/reconcile only as part of a final publish-run/deployment process. Test pages should not be static eligible for production. | Partially. Repair tool can normalize missing structure, but current false/true decisions are intentional booleans and should not be blindly overwritten. | Yes | Blocker for production workflow |
| Fulfillment disclosure | same 6 routes | `fulfillment.fulfillmentStatus`, `fulfillment.publicDisclosureRequired`, `googleAds.requiresDisclosure`, public page copy | Because current Ice fulfillment is `research_only_until_provider_confirmed`, set `publicDisclosureRequired: true` and ensure page copy clearly says requests are reviewed/matched before provider confirmation. If a direct partner is confirmed later, update fulfillment status and disclosure accordingly. | Partially for missing structures only. Current false disclosure values require intentional review. | Yes | Blocker |
| Service schema/products | `/ice-rink-rentals`, `/events-holiday-activations` | `serviceSchema.serviceName`, `serviceSchema.serviceType`, `serviceSchema.productsOffered`, optional `serviceSchema.areasServed`, `schemaControls.enableServiceSchema` | Add factual generic service schema values, such as service name for portable ice rink rentals/event activations, service type/category, and one or more products offered. Do not invent coverage, partner, or provider claims. Keep `publicSchemaEnabled` false until reviewed. | No, not fully. Field scaffolding exists, but product/service wording requires editorial approval. | Yes | Blocker for service-page SEO/content readiness |
| Form/lead routing | `/contact`, `/ice-rink-rentals`, `/events-holiday-activations` | `formConfig.domainRoutingKey`, `formConfig.staticFormEndpointKey`, `formConfig.conversionGoal`, `formConfig.recipientGroup`, `domainRouting.*` | Use the approved static form endpoint key and domain routing key, likely matching the staging/function plan, then set conversion goals for quote/contact CTAs. Example key shape only: `ice-rink-rentals-default`. Do not store credentials. | Partially. Contact defaults can be scaffolded; endpoint/routing keys require operator confirmation. | Yes | Blocker for static lead capture |

## Roller Repair Matrix

| Warning category | Affected routes | Source field/data area | Recommended source repair | Safe automation | Manual review | Production priority |
| --- | --- | --- | --- | --- | --- | --- |
| Local-proof copy/local-dev references | `/`, `/contact`, `/roller-rink-rentals` | `ContentData.ContentBlocks[*].content`, FAQ answers, CTA copy, link text, any text mentioning local proof/local testing/localhost | Replace local-proof/test language with production-safe Roller Rink Rentals copy, or keep the pages unpublished/noindex until final content exists. Do not invent provider facts. Remove user-facing references to local testing, seed proof, localhost, and non-production status. | No. This is editorial content. | Yes | Blocker |
| Workflow approval/status | same 3 routes | `workflow.status`, `workflow.reviewStatus`, `workflow.approvedForPublish`, approval stamps | Same pattern as Ice: approve only after production copy is ready. Until then keep draft/unapproved or unpublished. | No for approval itself. | Yes | Blocker |
| Revision/rollback readiness | same 3 routes | `revision.currentRevisionId`, `revision.rollbackAvailable`, latest snapshot metadata | Save each Roller page once through the normal admin editor or safe repair flow after snapshot support is active, so a pre-update rollback snapshot is created. | Yes through normal admin update/repair action, but do one page at a time and verify. | Light review | Operational blocker before serious edits |
| Static eligibility/stale rebuild | same 3 routes | `staticPublishing.staticEligible`, `staticPublishing.needsRebuild`, `deploymentStatus` | Mark only production-ready Roller pages as `staticEligible: true`. Keep `needsRebuild` true until the final package after content repair. | Partially. Structure can be normalized, final boolean decisions are manual. | Yes | Blocker for production workflow |
| Template identity | same 3 routes | `template.templateKey`, `template.templateVersion`, `template.layoutVariant`, `template.contentModelVersion` | Set `home` to `home`, `contact` to `contact`, and `roller-rink-rentals` to `service`. Keep version/layout values consistent with Ice unless a different template is intentionally chosen. | Yes, safe candidate for Page Quality Repair action, then verify. | Light review | Blocker |
| Fulfillment status | same 3 routes | `fulfillment.fulfillmentStatus`, `fulfillment.leadRoutingMode`, `fulfillment.publicDisclosureRequired`, `googleAds.*` | Use conservative non-direct fulfillment until provider/partner coverage is confirmed: `research_only_until_provider_confirmed`, `manualReviewRequired: true`, `leadRoutingMode` suitable for manual review, and `publicDisclosureRequired: true`. | Partially. Missing structures can be defaulted; final status needs operator approval. | Yes | Blocker |
| Form/lead routing | same 3 routes, strongest on `/contact` | `formConfig.formType`, `formConfig.domainRoutingKey`, `formConfig.staticFormEndpointKey`, `formConfig.conversionGoal`, `formConfig.recipientGroup`, `domainRouting.*` | Configure Roller contact form/routing metadata with non-secret keys, likely using key shape `roller-rink-rentals-default`, and set quote form/conversion fields where forms or CTAs exist. | Partially. Form type/conversion defaults are safe; endpoint/routing keys need confirmation. | Yes | Blocker |

## Page-Level Repair Checklist

### Ice `/`

- Decide whether the home page is production-ready.
- If yes: approve workflow, set static eligibility, set public disclosure for research-only fulfillment, then regenerate.
- If no: unpublish or exclude from production staging package.

### Ice `/contact`

- Approve workflow only after the form path is production/staging ready.
- Set `fulfillment.publicDisclosureRequired: true`.
- Set `formConfig.domainRoutingKey` and `formConfig.staticFormEndpointKey`.
- Verify Contact block field mappings still submit to Lead Inbox.

### Ice `/ice-rink-rentals`

- Add service schema name/type/products offered.
- Set fulfillment disclosure.
- Set CTA conversion goal and routing metadata if the CTA is expected to capture leads.
- Approve/static-eligible only after editorial review.

### Ice `/events-holiday-activations`

- Add service schema name/type/products offered.
- Set fulfillment disclosure.
- Set CTA conversion goal and routing metadata if the CTA is expected to capture leads.
- Approve/static-eligible only after editorial review.

### Ice test pages

- `/phase-3-duplicate-test-51412237`
- `/phase-6d-redirect-test`

Recommended production repair is not approval. These look like test pages and should be unpublished, removed from sitemap, or excluded from production packages before cutover. If they must remain for staging QA, keep them clearly out of production approval.

### Roller `/`

- Replace local-proof and localhost-oriented text with real production-safe Roller copy.
- Add template identity `home`.
- Set fulfillment metadata/disclosure.
- Create revision snapshot through safe save/repair flow.
- Approve/static-eligible only after copy review.

### Roller `/contact`

- Replace local-proof copy.
- Add template identity `contact`.
- Configure contact form type, routing key, static endpoint key, conversion goal, recipient group, and thank-you message.
- Set fulfillment metadata/disclosure.
- Create revision snapshot through safe save/repair flow.
- Verify Lead Inbox receives staging test submissions after endpoint wiring.

### Roller `/roller-rink-rentals`

- Replace local-proof copy.
- Add template identity `service`.
- Add conservative service schema/products offered if it remains a service page.
- Set fulfillment metadata/disclosure.
- Configure CTA conversion goal/routing if CTAs remain.
- Create revision snapshot through safe save/repair flow.

## Suggested Repair Mechanisms

Use the least risky mechanism per category:

1. Admin Page Quality Repair action:
   - good for missing template object, basic form config scaffolding, schema controls, pageQuality structure, revision creation via normal update path
   - not sufficient for editorial approval, production copy, direct fulfillment claims, or real routing endpoint decisions
2. Admin page editor:
   - best for workflow approval, static eligibility decisions, fulfillment disclosure, service schema/products, form/domain routing fields, and content copy
3. Form Builder:
   - best for contact form labels/fields and normalized lead mapping
4. Import package/source JSON:
   - useful when Timothy supplies final content packages; include repaired fields before import, then use validator/diff/preflight
5. Do not repair generated folders:
   - never edit `.static-artifacts`, `.static-content-snapshots`, `.static-release-dry-runs`, or `.next` directly

## Automation Safety

Safe to automate or semi-automate:

- Roller template inference
- creation of missing revision snapshots through one normal save/repair update per page
- missing form structure defaults
- missing schema control defaults
- pageQuality structure defaults

Requires manual review:

- workflow approval
- static eligibility for production
- clearing/reconciling `needsRebuild`
- fulfillment status and disclosure text
- static form endpoint/domain routing keys
- service schema wording/products offered
- Roller copy rewrite and local-proof removal
- excluding or unpublishing Ice test pages

## Recommended Fix Order

1. Unpublish or exclude Ice test pages from production packages.
2. Rewrite Roller local-proof/local-dev content.
3. Add Roller template identity and revision snapshots.
4. Configure form/static endpoint routing fields for Ice and Roller.
5. Complete fulfillment status and disclosure fields.
6. Add Ice service schema/products for service-like pages.
7. Decide workflow approval and static eligibility.
8. Generate a new fresh dry-run package.
9. Compare warning counts against Phase 7A baseline: Ice 40, Roller 30.

## Staging Decision

Azure default-host staging can proceed before these repairs if the goal is technical validation of upload, routes, assets, redirects, and static form wiring.

The staging handoff must include the Phase 7A/7B warning context. Do not treat the current packages as production-approved.

## Production Decision

Production cutover should wait.

Production blockers remain in source content, especially Roller local-proof copy, workflow approval, static eligibility, fulfillment disclosure, and form/static endpoint routing.

## Checks Run

- `git status --short` at start - clean
- reviewed Phase 7A report
- reviewed dry-run manifest and summary for `2026-05-21-1605`
- reviewed static/snapshot warning rules
- reviewed admin repair/editor source field support
- reviewed current CMS snapshot page summaries
- generated static output folders modified - no
- content repairs applied - no
- `node --check` for changed `.mjs` files - not applicable because Phase 7B changed no `.mjs` files
- `git diff --check` - passed
- direct trailing whitespace scan over this untracked report - passed
- protected config/workflow/generated-folder check - passed with no changes reported
- targeted secret scan over this report - passed; findings were limited to the phrase `non-secret keys` and check-status wording
- no generated static folders staged - passed

## Protected Files

Phase 7B did not modify:

- `apps/ice-rink-web/.env.local`
- `apps/pumpkin-api/appsettings.Development.json`

Phase 7B did not add or modify `.github/workflows`.

## Next Recommended Phase

Phase 7C should perform controlled source repairs through the admin workflow, starting with Roller copy/template/revision repairs and Ice test-page exclusion decisions. After source repairs, rerun the fresh package generation path and compare warning counts to the Phase 7A baseline.
