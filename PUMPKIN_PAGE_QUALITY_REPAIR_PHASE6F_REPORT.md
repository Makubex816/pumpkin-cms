# Pumpkin Page Quality Repair Phase 6F Report

## Summary

Phase 6F adds a tenant-scoped Page Quality Backfill / Repair Actions tool for safe production-readiness metadata normalization.

The tool is dry-run first. It previews repair plans, lets admins select pages and repair categories, and applies selected repairs through the existing authenticated admin page update endpoint so Phase 6C revision snapshots and rollback metadata remain active.

No Azure deployment, Cloudflare change, hard delete, provider research, state research, scraping, production page creation, or active GitHub Actions workflow was added.

## Files Changed

- `apps/admin/src/app/dashboard/publishing/page.tsx`
- `apps/admin/src/app/dashboard/publishing/repairs/page.tsx`
- `apps/admin/src/lib/page-repairs.ts`
- `apps/pumpkin-api/Services/PageRevisionHelper.cs`
- `apps/pumpkin-net-models/Models/Page.cs`
- `packages/pumpkin-ts-models/src/models/Page.ts`
- `packages/pumpkin-ts-models/dist/models/Page.d.ts`
- `packages/pumpkin-ts-models/dist/models/Page.d.ts.map`
- `packages/pumpkin-ts-models/dist/index.d.ts`
- `packages/pumpkin-ts-models/dist/index.d.ts.map`
- `packages/pumpkin-ts-models/dist/index.js.map`
- `PUMPKIN_PAGE_QUALITY_REPAIR_PHASE6F_REPORT.md`

## Route Added

The repair tool route is:

```text
apps/admin/src/app/dashboard/publishing/repairs/page.tsx
```

The Publishing Dashboard now includes a `Repair Metadata` link to this route.

## Repair Categories

The repair engine supports:

- Workflow defaults
- Static publishing defaults
- Template identity defaults
- Schema controls
- Form / lead capture defaults
- Internal linking defaults
- Media metadata defaults
- Page quality defaults
- Fulfillment / Google Ads safety defaults

## Repair Default Decisions

Workflow:

- unpublished pages default to `draft`
- published pages default to `published`
- `reviewStatus` defaults to `needs_review` unless existing approval state is already present
- `approvedForPublish` is not set true automatically
- `lastEditedBy` and `lastEditedAt` are backfilled only when missing

Static publishing:

- published pages default `staticEligible` to true
- unpublished pages default `staticEligible` to false
- repairs mark `needsRebuild` true
- unknown build/deploy timestamps remain blank
- missing deployment status defaults to `not_deployed`

Template identity:

- `home` slug infers `home`
- contact pages infer `contact`
- service/rental-like pages infer `service`
- unknown pages infer `general-page`
- template/content model versions default to `1`

Schema controls:

- WebPage and Breadcrumb schema default to enabled
- FAQ schema follows FAQ block presence
- Service schema follows service-like page inference

Form / lead capture:

- contact pages and Contact blocks default to `quote_request`
- conversion goal defaults to `quote_form_submit` for contact forms
- routing mode defaults to manual review/provider match for contact forms
- static form endpoint keys are not invented
- non-form pages are marked `not_configured`

Internal linking:

- home has no parent
- non-home pages default parent/hub to `home`
- breadcrumbs default to `home` plus current slug
- related pages are not invented

Media:

- missing media containers are created
- image license/usage defaults to `needs_review`
- missing image alt text is warned, not fabricated
- no image URLs are invented

Page quality:

- status defaults to `needs_review` or `draft`
- score defaults to null
- warning/blocking arrays are created
- `uniqueValueReason` remains blank and is warned for editorial review

Fulfillment / Ads:

- missing fulfillment defaults to conservative `research_only_until_provider_confirmed`
- lead routing defaults to `unmet_demand_followup`
- manual review is required by default
- Google Ads `eligible` defaults false
- policy and bridge-page risk default to `unknown`
- disclosures are required unless fulfillment is direct partner available

## Dry-Run / Preview Behavior

Repair plans are generated client-side from the selected tenant's page list. The plan shows:

- pages scanned
- repair counts by category
- affected pages
- selected repair categories
- changed fields preview
- warnings that remain editorial or launch-review work

No writes occur when previewing or selecting pages/categories.

## Apply Behavior

Admins can:

- select repair categories
- select affected pages
- preview the plan
- apply selected repairs after confirmation

Each updated page is sent through:

```text
apiClient.updatePage(..., { changeSource: "metadata_repair" })
```

The tool reports updated, skipped, and error counts.

## Revision / Rollback Interaction

`metadata_repair` was added as an allowed Page change source in `PageRevisionHelper`. Repair writes use the existing admin update endpoint, so the Phase 6C pre-update snapshot path remains active.

When metadata changes are applied:

- previous page state is captured by the API update path
- revision metadata records `lastChangeSource = metadata_repair`
- `staticPublishing.needsRebuild` is marked true
- no rollback controls were removed or bypassed

## Publishing Dashboard Integration

The main Publishing Dashboard now links to the repair tool. The repair page links back to the dashboard and uses the same selected tenant context.

## Import / Export Impact

JSON import/export preserves the updated Page shape because it exports full Page documents.

CSV/XLSX already preserve complex metadata objects through JSON columns such as:

- `googleAds`
- `pageQuality`
- `workflow`
- `formConfig`

No new flat CSV/XLSX columns were added in this phase. That keeps the bulk-edit surface stable while preserving repaired metadata through the existing JSON columns.

## Validation Impact

The repair tool should reduce existing publishing dashboard warnings for:

- missing workflow data
- missing static publishing metadata
- missing template identity
- missing schema controls
- missing form config containers
- missing linking containers
- missing media containers
- missing page quality containers
- missing fulfillment/Ads containers

Important editorial warnings remain intentionally unresolved, including missing unique value, missing detailed image alt text, unknown provider coverage, and missing real static form endpoint decisions.

## Runtime Verification

Verified without exposing local credentials:

- admin app route `/dashboard/publishing/repairs` is implemented
- repair route compiles in admin type-check
- targeted admin lint passes for the repair page and helper

Completed manual browser/runtime verification:

- Pumpkin API was restarted after build verification.
- Admin login worked.
- Repair Metadata route loaded.
- Ice tenant repair plan generated.
- A safe Ice test page was selected: `phase-6d-redirect-test`.
- A selected safe metadata repair was previewed before writing.
- Repair apply finished with updated `1`, skipped `0`, errors `0`.
- Page detail showed the repaired metadata.
- Revision metadata was preserved/created.
- `staticPublishing.needsRebuild` was true after repair.
- Existing page view/edit still worked.
- Existing redirect/previous-slug data remained intact.
- New public slug loaded.
- Old public slug redirected to the new slug.
- Roller tenant repair plan was dry-run/previewed without applying changes.
- No `.env.local` or `appsettings.Development.json` changes were made.

## Checks Run

- `npm run type-check` in `apps/admin` - passed
- targeted admin lint for publishing dashboard, repair page, repair helper, auth context, tenant selector, and admin layout - passed
- `dotnet build apps/pumpkin-net-models/pumpkin-net-models.csproj` - passed
- `dotnet build apps/pumpkin-api/pumpkin-api.csproj` - passed after stopping the locked local Pumpkin API process on port `5064`
- `packages/pumpkin-ts-models` TypeScript emit was attempted using the admin TypeScript compiler; it emitted updated dist types but reported pre-existing missing Node `require` type errors in `PageJsonConverter.ts`
- `GET http://localhost:3001/dashboard/publishing/repairs` - returned `200`
- `git diff --check` - passed
- protected config diff check for `.env.local` and `appsettings.Development.json` - no changes
- targeted secret literal scan over changed/untracked files - passed

## Known Limitations

- Repairs are metadata-only and intentionally do not generate production content.
- Static form endpoint keys are not invented.
- Detailed image alt text is not fabricated.
- Related page lists are not auto-generated.
- No server-side batch repair endpoint was added.
- CSV/XLSX flat columns were not expanded for every repair field; JSON object columns preserve the fields.
- Browser regression checks remain manual because local credentials are not stored in the repo.

## Next Recommended Phase

Phase 6G should add either a publish-run history/read-only audit screen or a controlled staging publish checklist that consumes the repaired metadata and CMS snapshot validation output.
