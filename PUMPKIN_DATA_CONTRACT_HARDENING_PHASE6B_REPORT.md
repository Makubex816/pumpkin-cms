# Pumpkin Data Contract Hardening - Phase 6B Report

## Executive Summary

Phase 6B hardens the Page data contract for production content readiness without creating provider research files, state research packages, or production pages.

The implementation adds safe optional Page extension objects for editorial workflow, revision readiness, static publishing, template identity, internal linking, structured data controls, form configuration, import provenance, and deployment hooks. Existing pages still render because these fields are metadata-only and default safely when missing.

## Files Changed

- `apps/admin/src/app/dashboard/pages/[id]/edit/page.tsx`
- `apps/admin/src/app/dashboard/pages/[id]/view/page.tsx`
- `apps/admin/src/app/dashboard/pages/import-export/page.tsx`
- `apps/admin/src/app/dashboard/pages/page.tsx`
- `apps/ice-rink-web/scripts/static-publish.mjs`
- `apps/ice-rink-web/scripts/snapshot-cms-content.mjs`
- `apps/pumpkin-net-models/Models/Page.cs`
- `packages/pumpkin-ts-models/src/models/Page.ts`
- `packages/pumpkin-ts-models/src/index.ts`
- generated `packages/pumpkin-ts-models/dist/*` model declaration/map updates
- removed the earlier research-schema Phase 6B artifacts so this branch no longer adds provider/state research files

## Data Contract Additions

New optional Page metadata objects:

- `workflow`
- `revision`
- `staticPublishing`
- `template`
- `linking`
- `schemaControls`
- `formConfig`
- `importProvenance`
- `deploymentHooks`

Page media assets now support production asset metadata:

- `assetId`
- `source`
- `licenseStatus`
- `usageStatus`
- `width`
- `height`
- `focalPointX`
- `focalPointY`

These fields are preserved through admin saves, JSON import/export, CSV/XLSX import/export, CMS snapshots, and static validation.

## Redirect And Slug History

Existing `previousSlugs` support remains. Phase 6B adds warnings when previous slugs exist because static redirect generation is not implemented yet.

Current state:

- `previousSlugs` editable in the admin editor
- slug changes still preserve page data
- static validation warns about redirect requirements
- actual static redirect files/config remain future work

## Workflow And Review Status

Added `workflow` fields:

- `status`
- `approvedForPublish`
- `approvedBy`
- `approvedAt`
- `lastEditedBy`
- `lastEditedAt`

Editable now:

- `workflow.status`
- `workflow.approvedForPublish`

Read-only/auto-managed now:

- `approvedBy`
- `approvedAt`
- `lastEditedBy`
- `lastEditedAt`

Static validation warns when published pages are not approved or do not use an approved/published workflow status.

## Revision And Rollback Readiness

Added `revision` fields:

- `revisionNumber`
- `revisionLabel`
- `lastRevisionAt`
- `lastRevisionBy`
- `rollbackAvailable`
- `rollbackNotes`

Rollback restore is not implemented. The editor shows a warning that rollback currently depends on exports/snapshots. Recommended future direction is a `PageRevision` collection or versioned file snapshots.

## Static Publishing Metadata

Added `staticPublishing` fields:

- `staticEligible`
- `needsRebuild`
- `lastSnapshotAt`
- `lastStaticBuildAt`
- `lastDeployedAt`
- `contentHash`
- `lastPublishedContentHash`
- `deploymentStatus`

Editable now:

- `staticEligible`
- `needsRebuild`

Read-only/future-populated:

- snapshot/build/deploy timestamps
- hashes
- deployment status

Editor saves mark pages as needing rebuild. Static validation warns when published pages are not static eligible.

## Template And Page Identity

Added `template` fields:

- `templateKey`
- `templateVersion`
- `layoutVariant`
- `contentModelVersion`

These are editable in the editor and exported/imported through CSV/XLSX and JSON. Static validation warns when published/source pages lack template identity.

## Internal Linking And Breadcrumbs

Added `linking` fields:

- `hubPage`
- `parentPage`
- `relatedPages`
- `requiredLinks`
- `breadcrumbTrail`

The editor exposes these as structured text/list fields. Static validation warns when `requiredLinks` are configured but not found in `ContentData`.

## Structured Data Controls

Added `schemaControls` fields:

- `enableWebPageSchema`
- `enableBreadcrumbSchema`
- `enableFAQSchema`
- `enableServiceSchema`
- `schemaWarnings`

The editor exposes schema toggles. Validation warns when FAQ content exists but FAQ schema is disabled.

## Lead Capture And Form Config

Added `formConfig` fields:

- `formType`
- `conversionGoal`
- `thankYouUrl`
- `thankYouMessage`
- `recipientGroup`
- `staticFormEndpointKey`
- `consentRequired`
- `spamProtectionEnabled`

Validation warns when Contact/CTA content exists but form type or conversion goal is missing.

## Import/Export Provenance And Locking

Added `importProvenance` fields:

- `lastImportBatchId`
- `sourceFile`
- `sourceRow`
- `externalId`
- `lockedFields`
- `overwriteBehavior`

Import/export preserves these fields. Field-level lock enforcement is not implemented yet; imports warn that `lockedFields` are advisory.

## Deployment/Build Hooks

Added `deploymentHooks` fields:

- `deploymentId`
- `buildId`
- `buildWarningCount`
- `publishSource`

These are read-only in the editor for now and intended for future static publish reports or deployment automation.

## Admin UX Decisions

Editable now:

- workflow status and approval flag
- static eligibility and rebuild flag
- template identity
- internal linking/breadcrumb planning fields
- structured data toggles
- form configuration
- media asset metadata

Read-only or auto-managed now:

- tenant/page IDs
- approval and last-edited stamps
- revision metadata
- static publish timestamps/hashes/deployment status
- import provenance
- deployment hooks
- schema warning list

Future-only:

- generated static redirects
- PageRevision collection and rollback restore UI
- content hash generation
- deployment/build history ingestion
- field-level import locking enforcement
- live deployment status updates

## Static Validation Warnings Added

Static source validation and CMS snapshot validation now warn on:

- previous slugs requiring static redirects
- published pages not approved for publish
- published pages missing approved/published workflow status
- published pages not static eligible
- `needsRebuild` still true
- missing template key/content model version
- missing media source/license/usage metadata where image URLs exist
- required links not found in page content
- FAQ blocks with FAQ schema disabled
- Contact blocks missing form type
- form/CTA pages missing conversion goal

Warnings do not fail builds yet.

## Checks Run

Passed:

- `..\..\apps\admin\node_modules\.bin\tsc.cmd -p tsconfig.json --typeRoots ..\..\apps\admin\node_modules\@types` in `packages/pumpkin-ts-models`
- `npm run type-check` in `apps/admin`
- targeted admin lint for changed page manager/editor/import-export files
- `npm run type-check` in `apps/ice-rink-web`
- `npm run lint` in `apps/ice-rink-web`
- `npm run build` in `apps/ice-rink-web`
- `node --check apps/ice-rink-web/scripts/static-publish.mjs`
- `node --check apps/ice-rink-web/scripts/snapshot-cms-content.mjs`
- `dotnet build apps/pumpkin-net-models/pumpkin-net-models.csproj`
- `npm run validate:static:ice`
- `npm run validate:static:roller`
- `npm run validate:snapshot:ice`
- `npm run validate:snapshot:roller`
- `npm run export:static:ice`
- `npm run export:static:roller`
- static output validator for Ice and Roller generated outputs
- `git diff --check` - passed with line-ending normalization warnings only
- trailing whitespace scan on changed app/model/report files - passed
- targeted secret-value scan on changed app/model/report files - passed; one scanner regex definition was ignored as a false positive
- protected file status check for `.env.local` and `appsettings.Development.json` - no changes
- `rg --files research` - no research files present

Expected warnings:

- Existing seed and CMS snapshot pages have not been backfilled with workflow approval, static eligibility, template identity, fulfillment status, and form config metadata yet.
- Ice seed static validation currently reports 29 warnings.
- Roller seed static validation currently reports 22 warnings.
- CMS snapshot validation passes structurally but reports similar backfill warnings.

## Known Limitations

- Static redirects are only warned, not generated.
- Rollback is advisory only until a PageRevision collection or file snapshot strategy is implemented.
- Field locks are preserved but not enforced.
- Static publish timestamps, hashes, and deployment IDs are not populated automatically yet.
- Existing pages need metadata backfill before staging/live deployment readiness is clean.

## Research Scope

No provider research files, state research packages, real provider claims, production pages, scraping, Azure deployment, or Cloudflare changes were added in this phase.

## Next Recommended Phase

Backfill the new contract fields on the existing core Ice and Roller pages, then add content-hash/static redirect generation in a small follow-up before final production content JSONs are created.
