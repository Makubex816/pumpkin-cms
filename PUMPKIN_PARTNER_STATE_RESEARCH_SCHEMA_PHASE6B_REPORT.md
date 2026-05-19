# Pumpkin Partner State Research Schema - Phase 6B Report

## Summary

Phase 6B adds the research/data foundation for partner coverage, provider research, state research, page recommendation scoring, and lead routing. This phase does not create production pages, scrape the web, deploy anything, or claim real provider coverage.

The new research layer is meant to sit before page generation. It helps decide whether a state/service page should exist at all, whether it should be indexed, whether it is safe for Google Ads, and how a lead should be routed.

## Files Added

- `research/README.md`
- `research/schemas/partner.schema.json`
- `research/schemas/provider.schema.json`
- `research/schemas/state-research.schema.json`
- `research/schemas/page-recommendation.schema.json`
- `research/schemas/lead-routing.schema.json`
- `research/partners/primary-party-rental-partner.template.json`
- `research/providers/_provider-research.template.json`
- `research/lead-routing/_lead-routing.template.json`
- `research/sites/ice-rink-rentals/README.md`
- `research/sites/ice-rink-rentals/states/_state-research.template.json`
- `research/sites/ice-rink-rentals/page-recommendations/_page-recommendation.template.json`
- `research/sites/roller-rink-rentals/README.md`
- `research/sites/roller-rink-rentals/states/_state-research.template.json`
- `research/sites/roller-rink-rentals/page-recommendations/_page-recommendation.template.json`
- `research/scripts/validate-research.mjs`

## Data Model Decisions

The research layer is JSON-first and repo-local. It is not production CMS content yet. Every template record is explicitly marked with `recordStatus: "template"` and uses placeholder-safe values.

The schemas use strict objects with required fields and `additionalProperties: false` so future records stay predictable. This makes the data easier to validate before it feeds the admin editor, page generation, static snapshots, or lead routing.

## Partner Matrix Schema

The partner schema supports:

- confirmed services, states, and cities
- possible extended service areas
- manual review requirements outside core coverage
- inventory capabilities for synthetic ice, real ice, and portable roller rinks
- setup requirements
- insurance and municipal event support
- lead routing preferences
- public name, logo, and photo usage flags

The included partner file is a template only and makes no real partner claims.

## Provider Schema

The provider schema supports manual research records for third-party companies. It includes evidence URLs, evidence notes, service-state/city coverage, fit signals, confidence, routing fit, and a 35-point score model.

Provider score categories are:

- portable rink service, 0 to 5
- state/region service, 0 to 5
- nearby location presence, 0 to 4
- event rental relevance, 0 to 4
- website clarity/proof, 0 to 4
- commercial event capacity, 0 to 4
- response/contact quality, 0 to 3
- review/reputation signals, 0 to 3
- lead routing fit, 0 to 3

## State Research Schema

The state research schema captures site, state, primary service, primary keyword, research status, target metros/cities, event demand zones, venue types, seasonal notes, climate/logistics notes, service coverage notes, fulfillment notes, recommended page count, page recommendation references, warnings, and next research actions.

Research statuses are:

- `not_started`
- `in_progress`
- `provider_research_complete`
- `page_map_ready`
- `approved_for_content`
- `paused`

## Page Recommendation Scoring

Page recommendations use a 30-point score:

- search volume demand, 0 to 5
- supplier coverage, 0 to 5
- event/location density, 0 to 5
- lead value, 0 to 5
- unique intent, 0 to 5
- content depth possible, 0 to 5

The validator warns when `publishRecommended` is true below the current threshold of 20. It also warns when a page lacks a target keyword, lacks a unique value reason, has weak fulfillment, or is Google Ads eligible while still research-only.

## Lead Routing Model

Lead routing records use the confirmed fulfillment statuses:

- `direct_partner_available`
- `partner_network_or_researched_provider`
- `research_only_until_provider_confirmed`

Supported routing modes are:

- `send_to_primary_partner`
- `manual_review_then_provider_match`
- `researched_provider_match`
- `unmet_demand_followup`

Supported fallback actions are:

- `store_for_manual_review`
- `send_to_primary_partner`
- `match_to_researched_provider`
- `mark_unmet_demand`
- `do_not_route`

Direct partner routing requires a partner ID. Researched provider routing requires provider IDs.

## Validation Behavior

`research/scripts/validate-research.mjs` validates JSON syntax, schema shape, required fields, enum values, scoring ranges, score totals, page recommendation rules, lead routing rules, and placeholder-looking content safety.

It performs no external API calls and no web scraping.

## How This Feeds Page Generation

Future page generation should start with approved page recommendations, not raw location lists. A page should be created only after the research record shows unique value, fulfillment clarity, and routing safety.

The intended flow is:

1. Research partner/provider/state data.
2. Validate research records.
3. Approve page recommendations.
4. Generate or draft CMS pages.
5. Review in the admin editor.
6. Publish in Pumpkin CMS.
7. Snapshot CMS content.
8. Static export and dry-run package the public site.

## SEO And Google Ads Safety

The page recommendation schema keeps SEO and paid-search risk visible before content exists. It tracks target keyword, buyer intent, unique value reason, noindex recommendation, publish recommendation, Google Ads eligibility, fulfillment status, and public disclosure requirements.

Research-only fulfillment defaults toward noindex and manual follow-up. Google Ads eligibility with weak fulfillment is flagged as a warning.

## Static Publishing Support

This phase supports the Option C static-first workflow by making page eligibility and routing decisions explicit before a CMS page is published and snapshotted. The static export system should consume approved CMS pages, while this research layer remains the pre-content planning and approval source.

## Checks Run

- `node research/scripts/validate-research.mjs` - passed with 7 files checked, 0 errors, 0 warnings.
- `git diff --check` - passed.
- trailing whitespace scan on `research/` and this report - passed.
- targeted secret-pattern scan on `research/` and this report - passed.
- `.env.local` and `appsettings.Development.json` status check - no changes.
- placeholder/provider claim inspection - only template names and `example.com` placeholders are present.

## Known Limitations

- The validator is intentionally local and lightweight. It does not implement every JSON Schema feature, only the features used by the current schemas.
- There are no real partner or provider records yet.
- There is no live provider research, no web scraping, and no production page generation in this phase.
- The research records are not yet wired into the admin UI.

## Next Recommended Phase

Phase 6C should create the first-state research package for one selected site and one selected state. It should add manually reviewed partner/provider notes, state research, page recommendations, and draft lead-routing records without creating production pages until Timothy reviews the recommendation tree.
