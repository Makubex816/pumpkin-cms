# Content JSON Contracts

## Purpose

Phase 6M adds a dry-run contract validator for externally generated Pumpkin CMS Page JSON. Timothy can generate content JSON outside the CMS, then validate it before import, static snapshot, or production publishing review.

The validator does not save pages, deploy to Azure, modify Cloudflare, scrape providers, create research files, or create production pages.

## Supported Input Shapes

The admin validator accepts:

- one Page JSON document
- an array of Page JSON documents
- a wrapped export object:

```json
{
  "tenantId": "ice-rink-rentals",
  "pages": []
}
```

Validation is tenant-scoped to the currently selected admin tenant.

## Template Contracts

Contracts are available for:

- `home`
- `contact`
- `service`
- `state-service-hub`
- `city-service-area`
- `event-use`
- `product-intent`
- `general-page`

Each contract defines:

- required page fields
- required SEO fields
- required media slots
- required blocks
- allowed blocks
- required fulfillment fields
- required lead/form fields
- required internal linking fields
- static publishing requirements

The admin UI exposes these requirements before validation.

## Blocking Errors

Blocking errors should be fixed before import or publish review. Examples:

- invalid JSON
- missing `tenantId`
- tenant mismatch
- missing `pageSlug`
- duplicate same-tenant slug in the payload
- missing required SEO fields
- invalid or slug-mismatched canonical URL
- missing required blocks
- invalid `ContentData.ContentBlocks`
- missing required image slot URL/alt
- invalid fulfillment enum
- direct partner fulfillment without `primaryPartnerAvailable`

## Warnings

Warnings are publishing-readiness review items. Examples:

- slug normalization suggestion
- canonical host mismatch
- media URL without `assetId`
- media license or usage status needing review
- missing optional lead mappings
- static publishing metadata not yet recorded
- sitemap page with no canonical
- sitemap page with `noindex`
- redirect records that need review

Warnings do not write or block in the validator itself.

## Media Expectations

Required page-level image slots should use the Phase 6A/6K/6L media shape:

```json
{
  "assetId": "example-asset",
  "url": "https://example.test/media/example.jpg",
  "alt": "Descriptive alt text",
  "title": "Example image",
  "caption": "",
  "source": "placeholder example",
  "licenseStatus": "needs_review",
  "usageStatus": "needs_review",
  "width": 1200,
  "height": 800,
  "focalPointX": 0.5,
  "focalPointY": 0.5,
  "decorative": false
}
```

`assetId` is recommended so Media Library references stay traceable. Missing `assetId` is a warning, not a hard failure.

## Forms And Lead Capture

Templates with quote/contact intent should include:

- `formConfig.formType`
- `formConfig.conversionGoal`
- `formConfig.routingMode`
- a `Contact` block when the contract requires a form
- mappable fields for name, email, phone, event location, message, or event date depending on template

The validator checks field labels, keys, names, placeholders, and normalized field maps.

## Fulfillment And Disclosure

Allowed fulfillment statuses:

- `direct_partner_available`
- `partner_network_or_researched_provider`
- `research_only_until_provider_confirmed`

Allowed lead routing modes:

- `send_to_primary_partner`
- `manual_review_then_provider_match`
- `researched_provider_match`
- `unmet_demand_followup`

Non-direct fulfillment should generally require public disclosure. Google Ads eligibility on research-only pages should be reviewed before launch.

## Static Publishing

The validator checks static-readiness fields such as:

- `includeInSitemap`
- `staticPublishing.staticEligible`
- `staticPublishing.needsRebuild`
- `staticPublishing.deploymentStatus`
- canonical URL alignment
- robots/sitemap consistency

Static export still consumes validated Page documents or CMS snapshots later; the validator does not build or deploy.

## Examples

Placeholder-safe examples live in:

```text
deployment/static-azure/content-json-template-examples/page-template-examples.json
```

These examples use `example-tenant` and `example.test` domains. They are documentation fixtures only and are not production pages.
