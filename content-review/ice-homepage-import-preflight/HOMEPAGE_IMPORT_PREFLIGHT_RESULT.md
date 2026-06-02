# Homepage Import Preflight Result

Generated from `homepage-import-preflight-result.json` on June 2, 2026.

## Candidate

- tenantId: `ice-rink-rentals`
- siteKey: `ice-rink-rentals`
- pageSlug: `home`
- route: `/`
- canonicalUrl: `https://iceskatingrinkrentals.com/`
- isPublished: `false`
- includeInSitemap: `false`
- workflowStatus: `normalizer_verified_review_only`
- block count: 10
- form key: `default-quote-request`
- unresolved media requirements: 6

## Passed Checks

- JSON parse
- targeted secret scan
- tenant/site guard
- slug/route/canonical guard
- required homepage blocks
- known block types
- rich block safety
- focused homepage import fields
- default form reference guard
- business/approval blocker classification
- unsafe HTML/CSS/form/media/email scan
- .NET Page/block contract validation

## Warnings

- `sectionScopedCss` does not appear scoped to `.home-proposed-setup`.
- `sectionScopedCss` does not appear scoped to `.home-proposed-use-cases`.
- `sectionScopedCss` does not appear scoped to `.home-service-areas-teaser`.
- 6 media requirements remain unresolved.
- .NET returned warnings for `mediaRequirements.unresolved` and `page.reviewOnlyField`.

## Classification

- `preflight-valid-for-shape`: `true`
- `preflight-valid-for-local-draft-import`: `conditional-with-explicit-unresolved-media-and-review-approval`
- `preflight-valid-for-CMS-import`: `false`
- `preflight-valid-for-production`: `false`

## Decision

The homepage candidate is valid for local shape review, but it is not CMS-import-ready. It may only proceed toward a local draft import if the user explicitly authorizes unresolved MediaAsset placeholders and review-only fields.

