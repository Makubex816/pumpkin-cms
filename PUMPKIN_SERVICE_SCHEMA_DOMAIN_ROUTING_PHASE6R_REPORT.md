# Pumpkin Phase 6R: Service Schema, Areas Served, Products Offered, And Domain Email Routing

## Summary

Phase 6R adds a safe app/data-contract layer for production content JSON readiness. It introduces page-level service schema fields, products offered, areas served, and non-secret domain/contact routing metadata without creating provider research, production pages, email accounts, credentials, deployments, or Cloudflare changes.

## Files Changed

- `packages/pumpkin-ts-models/src/models/Page.ts`
- `packages/pumpkin-ts-models/src/index.ts`
- `packages/pumpkin-ts-models/dist/models/Page.d.ts`
- `packages/pumpkin-ts-models/dist/index.d.ts`
- `apps/pumpkin-net-models/Models/Page.cs`
- `apps/admin/src/app/dashboard/pages/[id]/edit/page.tsx`
- `apps/admin/src/app/dashboard/pages/[id]/view/page.tsx`
- `apps/admin/src/app/dashboard/pages/import-export/page.tsx`
- `apps/admin/src/app/dashboard/pages/import-diff/page.tsx`
- `apps/admin/src/lib/content-json-contracts.ts`
- `apps/admin/src/lib/import-diff.ts`
- `apps/admin/src/lib/publishing-readiness.ts`
- `apps/ice-rink-web/src/components/StructuredData.tsx`
- `apps/ice-rink-web/src/components/PageRenderer.tsx`
- `apps/ice-rink-web/src/config/sites.ts`
- `apps/ice-rink-web/scripts/static-publish.mjs`
- `apps/ice-rink-web/scripts/snapshot-cms-content.mjs`
- `deployment/static-azure/service-schema-domain-routing.md`

## Data Shape

Added `page.serviceSchema`:

- `serviceName`
- `serviceType`
- `serviceCategory`
- `productsOffered`
- `areasServed`
- `audience`
- `eventTypes`
- `schemaOutputMode`
- `publicSchemaEnabled`
- `notes`

Added non-secret `page.domainRouting` metadata and expanded `page.formConfig` with routing fields:

- `domainRoutingKey`
- `replyToMode`
- `emailSubjectTemplate`
- `mailtoFallbackEnabled`

## Products Offered

`productsOffered` supports simple factual service/product rows with `name`, `type`, `description`, `url`, `category`, `isPrimary`, and `displayOrder`.

## Areas Served

`areasServed` supports `Country`, `State`, `City`, `County`, `Metro`, `Region`, `ServiceArea`, and `Custom`. Public JSON-LD maps this internal field to Schema.org `areaServed`.

## Domain And Email Routing

The routing metadata is status/configuration only. No SMTP passwords, provider tokens, API keys, or email credentials are stored. The frontend only uses `domainRouting.publicContactEmail` for public mailto/contact display when `mailtoLinksEnabled` is true.

## Admin UI

The structured page editor now includes:

- Service schema fields
- Products offered rows
- Areas served rows
- Public schema enablement
- Domain routing snapshot fields
- Lead routing/domain email reference fields on `formConfig`

The read-only page detail screen also displays service schema and domain routing metadata.

## Validator Changes

The content JSON contract validator now warns on service-like pages that are missing:

- `serviceSchema.serviceName`
- `serviceSchema.serviceType`
- `serviceSchema.productsOffered`
- `serviceSchema.areasServed` for location/service-area templates
- routing fields needed for Ads/form readiness

Malformed `serviceSchema`, `productsOffered`, or `areasServed` shapes are reported as blocking errors when they would break import assumptions.

## Staging, Diff, And Preflight

The import diff engine now summarizes and risk-tags changes to:

- `serviceSchema.serviceName`
- `serviceSchema.serviceType`
- `productsOffered`
- `areasServed`
- `serviceSchema.publicSchemaEnabled`
- `formConfig.domainRoutingKey`
- `formConfig.recipientGroup`
- `formConfig.staticFormEndpointKey`
- `domainRouting`

Import preflight receives these warnings through the existing contract and diff reports.

## Import/Export Impact

JSON import/export preserves the full new fields. CSV/XLSX now include flattened columns for:

- `serviceSchema.serviceName`
- `serviceSchema.serviceType`
- `productsOffered`
- `areasServed`
- `serviceSchema`
- `formConfig.domainRoutingKey`
- `formConfig.recipientGroup`
- `formConfig.staticFormEndpointKey`
- `domainRouting`

JSON remains the preferred production content package format.

## Static And Schema Impact

Static/public rendering now supports optional Service JSON-LD output when `serviceSchema.publicSchemaEnabled` is true and required service fields are present. The output maps `areasServed` to Schema.org `areaServed` and `productsOffered` to `hasOfferCatalog`.

Snapshot/static validation scripts now warn when service-like pages are missing service schema, products, areas, or routing fields.

## Checks Run

- `npm run type-check` in `apps/admin`: passed
- targeted admin ESLint for changed admin files: passed
- `npm run type-check` in `apps/ice-rink-web`: passed
- `npm run lint` in `apps/ice-rink-web`: passed
- `npm run build` in `apps/ice-rink-web`: passed
- `dotnet build` in `apps/pumpkin-net-models`: passed
- `dotnet build` in `apps/pumpkin-api`: passed after stopping the local running API process that locked `pumpkin-net-models.dll`
- `git diff --check`: passed with expected Windows LF-to-CRLF working-copy warnings only
- protected config check for `.env.local` and `appsettings.Development.json`: passed with no changes
- targeted secret-pattern scan: reviewed matches were policy/documentation text and existing non-secret environment variable references; no committed credential values were found

## Runtime Verification

Automated/local smoke verification was performed with a temporary in-memory placeholder Page JSON only. No Page documents were created or modified.

- Ran the actual `validateContentJsonText` content contract helper against a local-only `state-service-hub` placeholder page containing `serviceSchema`, one `productsOffered` item, one Pennsylvania `areasServed` item, and placeholder-safe lead/domain routing references.
- Confirmed the validator accepted the `serviceSchema.productsOffered` and `serviceSchema.areasServed` structure with 0 blocking errors.
- Removed `productsOffered` and confirmed the validator emitted a `service_schema` warning for `serviceSchema.productsOffered`.
- Removed `areasServed` and confirmed the validator emitted `service_schema` warnings for `serviceSchema.areasServed` on a location/service-area template.
- Ran the actual `buildImportDiffReport` helper against in-memory current-page fixtures only.
- Confirmed a new placeholder slug previews as `create`.
- Confirmed an incoming page matching the safe test slug `phase-6d-redirect-test` previews as `update` without writing.
- Confirmed Import Diff summarizes changes to `serviceSchema.productsOffered`, `serviceSchema.areasServed`, and `formConfig.domainRoutingKey`.
- Confirmed Import Diff warns when `productsOffered`, `areasServed`, or domain routing fields are missing.
- Ran an automated preflight-equivalent check using the same contract and diff reports consumed by Import/Export preflight. It surfaced warning/risk counts for missing products, areas, and routing fields and did not execute import.
- The optional page editor persistence mutation test was not run because this smoke pass intentionally avoided modifying Page documents.
- Public/frontend Service JSON-LD behavior remains code/build verified: Service schema output is gated by `serviceSchema.publicSchemaEnabled`; no browser render mutation was performed.
- No real emails, email credentials, provider/state research files, production pages, Azure deployment, Cloudflare changes, static deployment, or protected config changes were created.

## Known Limitations

- No tenant settings editor was added.
- No email accounts, SMTP provider integration, or sending logic was added.
- No provider/state research or production page content was created.
- CSV/XLSX support is useful for bulk review, but JSON remains canonical for production content packages.
- Schema generation is intentionally conservative and only emits public Service JSON-LD when explicitly enabled.

## Next Recommended Phase

Phase 6S: Tenant/Site Settings editor for non-secret domain routing defaults and publish/contact configuration history.
