# Pumpkin Content JSON Contract Validator Phase 6M Report

## Summary

Phase 6M adds a dry-run Content JSON Contract Validator so externally generated Page JSON can be checked before import, static publishing, or production review. The validator is app-build focused only: it does not create provider/state research files, production pages, Cosmos records, Azure deployments, Cloudflare changes, hard deletes, or binary uploads.

## Files Changed

- `apps/admin/src/lib/content-json-contracts.ts`
- `apps/admin/src/app/dashboard/pages/content-validator/page.tsx`
- `apps/admin/src/app/dashboard/pages/import-export/page.tsx`
- `deployment/static-azure/content-json-contracts.md`
- `deployment/static-azure/content-json-template-examples/page-template-examples.json`
- `PUMPKIN_CONTENT_JSON_CONTRACT_VALIDATOR_PHASE6M_REPORT.md`

## Template Contracts

Defined contracts for:

- `home`
- `contact`
- `service`
- `state-service-hub`
- `city-service-area`
- `event-use`
- `product-intent`
- `general-page`

Each contract exposes:

- required page fields
- required SEO fields
- required media slots
- required and allowed blocks
- fulfillment fields
- lead/form fields
- internal linking fields
- static publishing requirements

The admin UI can auto-detect the contract from `template.templateKey` / `MetaData.pageType` or force a specific contract.

## Validator Behavior

The validator accepts:

- one Page JSON document
- an array of Page documents
- a wrapped export object with `pages[]`

It is dry-run only and reports blocking errors separately from warnings.

Blocking checks include:

- JSON parse/shape errors
- tenant mismatch
- missing required page/SEO/fulfillment fields
- duplicate same-tenant slugs in the payload
- canonical URL parse/path mismatch
- missing required blocks
- invalid `ContentData.ContentBlocks`
- missing required image slot URL/alt
- invalid fulfillment status or lead routing mode
- direct-partner fulfillment without `primaryPartnerAvailable`

Warning checks include:

- slug normalization suggestions
- canonical host mismatch against known tenant profile
- media URL without `assetId`
- media license/usage needing review
- sitemap/robots consistency
- missing lead field mappings
- redirect loops or malformed redirect arrays
- missing static publishing/linking metadata

## Admin UI

Added route:

```text
/dashboard/pages/content-validator
```

The UI supports:

- paste JSON
- upload `.json`
- select template contract or auto-detect
- view template requirements
- run dry-run validation
- view per-page errors/warnings
- download a JSON validation report

The existing Page Import/Export screen now links to the validator through “Validate content JSON.”

## Documentation And Examples

Added:

```text
deployment/static-azure/content-json-contracts.md
deployment/static-azure/content-json-template-examples/page-template-examples.json
```

The sample JSON uses `example-tenant` and `example.test` placeholder values only. It is documentation/test material, not production content.

## Runtime Verification

Completed:

- Admin dev route `/dashboard/pages/content-validator` returned HTTP `200`.
- Example JSON parsed successfully with Node.
- TypeScript compilation verified the validator and route.
- Manual browser login worked.
- `/dashboard/pages/content-validator` loaded successfully.
- File upload control appeared and allowed JSON selection.
- The example JSON file at `deployment/static-azure/content-json-template-examples/page-template-examples.json` validated successfully.
- Paste-mode validation worked.
- Malformed JSON produced a helpful validation error and did not crash.
- A minimal page missing production-readiness fields produced expected errors/warnings.
- Validator displayed per-page results, warnings, and errors clearly.
- Download Report became available after validation.
- The page clearly stated that no pages were written.
- No page was imported, saved, deployed, or published by the validator.
- Existing Import/Export page remained separate from validation.
- No `.env.local` or `appsettings.Development.json` changes.

## Checks Run

- `npm run type-check` in `apps/admin` - passed
- targeted admin lint for validator route, validator lib, and import/export link - passed
- example JSON parse check - passed
- route smoke check for `/dashboard/pages/content-validator` - HTTP `200`
- `git diff --check` - passed with line-ending normalization warnings only
- protected config check for `.env.local` and `appsettings.Development.json` - no changes
- targeted high-confidence secret scan over changed files - passed

## Known Limitations

- The validator does not import pages.
- The validator does not call the Pumpkin API or verify asset IDs against Cosmos MediaAsset records.
- Placeholder examples currently provide representative Page JSON fixtures rather than a complete production content pack.
- Static export is not run by this UI.
- Future work may add a backend validation endpoint if build pipelines need server-side validation outside the admin browser.

## Next Recommended Phase

Add a pre-import validator handoff: require JSON import dry-runs to optionally run and attach this contract report before write modes are enabled for externally generated content batches.
