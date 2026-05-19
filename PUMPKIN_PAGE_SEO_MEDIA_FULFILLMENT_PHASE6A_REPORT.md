# Pumpkin Page SEO, Media, Fulfillment Phase 6A Report

## Summary

Phase 6A adds production-readiness fields for SEO, media, fulfillment, Google Ads, and page quality while preserving the existing page renderer, import/export flow, static export mode, and CMS snapshot workflow.

The implementation avoids drag/drop editing and hard delete. New fields are stored as structured Page metadata so they survive admin saves, JSON import/export, CSV/XLSX bulk edits, CMS snapshots, and static publishing validation.

## Files Changed

- `apps/admin/src/app/dashboard/pages/[id]/edit/page.tsx`
- `apps/admin/src/app/dashboard/pages/import-export/page.tsx`
- `apps/admin/src/app/dashboard/pages/page.tsx`
- `apps/ice-rink-web/scripts/snapshot-cms-content.mjs`
- `apps/ice-rink-web/scripts/static-publish.mjs`
- `apps/pumpkin-net-models/Models/Page.cs`
- `deployment/static-azure/scripts/static-publish-dry-run.mjs`
- `packages/pumpkin-ts-models/src/models/Page.ts`
- `packages/pumpkin-ts-models/src/index.ts`
- generated `packages/pumpkin-ts-models/dist/*` declaration/map updates for Page model typing
- `PUMPKIN_PAGE_SEO_MEDIA_FULFILLMENT_PHASE6A_REPORT.md`

## Chosen Data Shape

Existing fields remain authoritative where they already fit:

- Visible page title/H1: `MetaData.title`
- Editable slug: `pageSlug`
- Page type: `MetaData.pageType`
- State/city/metro/county: `searchData`
- Primary service: `MetaData.product`
- Target keyword: `MetaData.keyword` and `searchData.keyword`
- Secondary keywords: `seo.keywords`

New model-safe Page fields:

- `previousSlugs: string[]`
- `sitemapPriority: number | null`
- `sitemapChangeFrequency: string`
- `media`
- `fulfillment`
- `googleAds`
- `pageQuality`

The added `media` structure:

```json
{
  "featuredImage": { "url": "", "alt": "", "title": "", "caption": "", "decorative": false },
  "heroImage": { "url": "", "alt": "", "title": "", "caption": "", "decorative": false },
  "localImage": { "url": "", "alt": "", "title": "", "caption": "", "decorative": false },
  "closingImage": { "url": "", "alt": "", "title": "", "caption": "", "decorative": false },
  "openGraphImage": { "url": "", "alt": "" }
}
```

## Editor Fields Added

The structured page editor now exposes:

- Basics: title/H1, slug, description, page type, primary service, target keyword, secondary keywords, geography, buyer intent, landing page type
- SEO: meta title, meta description, robots, canonical, Open Graph title/description/image/alt, Twitter title/description/image
- Media: featured, hero, local/dynamic, closing, and Open Graph image slots with alt text
- Fulfillment: fulfillment status, routing mode, partner/research flags, provider count, service states, disclosure flag
- Ads: eligibility, final URL, landing page type, campaign theme, conversion goals, notes
- Publishing/Quality: published, sitemap include, previous slugs, sitemap priority/change frequency, launch notes

## Import/Export Columns Added

CSV/XLSX now include flattened production columns:

- `targetKeyword`
- `secondaryKeywords`
- `pageType`
- `state`
- `city`
- `region`
- `metro`
- `county`
- `primaryService`
- `buyerIntent`
- `landingPageType`
- `previousSlugs`
- `sitemapPriority`
- `sitemapChangeFrequency`
- `fulfillmentStatus`
- `primaryPartnerAvailable`
- `leadRoutingMode`
- `publicDisclosureRequired`
- `googleAds.eligible`
- `googleAds.finalUrl`
- `featuredImage.url`
- `featuredImage.alt`
- `heroImage.url`
- `heroImage.alt`
- `localImage.url`
- `localImage.alt`
- `closingImage.url`
- `closingImage.alt`

Complex JSON columns were also added for safer round-trip preservation:

- `media`
- `fulfillment`
- `googleAds`
- `pageQuality`

JSON import/export already preserves the full Page document shape and now includes the new model fields.

## Static Validation Warnings Added

Static source validation and CMS snapshot validation now warn, without failing, when published/source pages are missing:

- target keyword
- SEO meta title
- SEO meta description
- canonical URL
- robots setting
- sitemap canonical alignment
- fulfillment status
- public disclosure for non-direct fulfillment
- image alt text when image URL exists
- Google Ads eligible page missing meta description
- Google Ads eligible page missing form/CTA
- Google Ads eligible page using research-only fulfillment
- invalid sitemap priority range

The dry-run manifest/summary now includes per-site page quality warning counts.

## Fulfillment Routing Model

Allowed `fulfillment.fulfillmentStatus` values in the editor:

- `direct_partner_available`
- `partner_network_or_researched_provider`
- `research_only_until_provider_confirmed`

Allowed `fulfillment.leadRoutingMode` values:

- `send_to_primary_partner`
- `manual_review_then_provider_match`
- `researched_provider_match`
- `unmet_demand_followup`

The validator warns when a non-direct page does not mark `publicDisclosureRequired`.

## Google Ads Handling

The editor and imports support:

- `googleAds.eligible`
- `googleAds.finalUrl`
- `googleAds.landingPageType`
- `googleAds.campaignTheme`
- `googleAds.conversionGoals`
- `googleAds.notes`

Launch warnings are generated for eligible pages that are missing meta descriptions, missing form/CTA paths, or still use research-only fulfillment.

## Checks Run

Passed:

- `..\..\apps\admin\node_modules\.bin\tsc.cmd -p tsconfig.json --typeRoots ..\..\apps\admin\node_modules\@types` in `packages/pumpkin-ts-models`
- `npm run type-check` in `apps/admin`
- `npm run type-check` in `apps/ice-rink-web`
- targeted admin lint for changed admin files
- `npm run lint` in `apps/ice-rink-web`
- `node --check apps/ice-rink-web/scripts/static-publish.mjs`
- `node --check apps/ice-rink-web/scripts/snapshot-cms-content.mjs`
- `node --check deployment/static-azure/scripts/static-publish-dry-run.mjs`
- `dotnet build apps/pumpkin-net-models/pumpkin-net-models.csproj`
- `npm run build` in `apps/ice-rink-web`
- `npm run validate:static:ice`
- `npm run validate:static:roller`
- `npm run export:static:ice`
- `npm run export:static:roller`
- static output validator for Ice and Roller
- `npm run publish:dry-run`
- `npm run validate:snapshot:ice`
- `npm run validate:snapshot:roller`
- static build/generate from existing CMS snapshots for Ice and Roller

Expected warnings:

- Existing seed and snapshot pages do not yet have `fulfillment.fulfillmentStatus`, so static validation reports warnings but does not fail.

Blocked or not fully run:

- Full admin lint still fails on pre-existing unrelated legacy lint errors outside the changed files.
- `dotnet build apps/pumpkin-api/pumpkin-api.csproj` was blocked by a running local `pumpkin-api` process locking the output DLL; the changed model project itself builds cleanly.
- Browser-level JSON/CSV/XLSX export/download was not manually runtime-verified in this pass; type-check and targeted lint cover the changed import/export code path.

## Known Limitations

- Existing pages need editorial backfill for fulfillment status, public disclosure, media alt text, and Ads decisions.
- New fields do not alter public rendering yet, except sitemap priority/change frequency in generated sitemap XML.
- Previous slugs are stored for future redirect planning, but redirect generation is not implemented in Phase 6A.
- Static validation warnings are advisory for now and intentionally do not block builds.

## Next Recommended Phase

Phase 6B should backfill production readiness fields for Ice and Roller core pages, then create an approval checklist for state/service/lead-routing pages before any real staging deployment.
