# Pumpkin Research Data Foundation

This folder is the research and approval layer for future Pumpkin CMS state, city, service, and lead-routing pages.

It is intentionally separate from production page content. Records here should guide page creation, fulfillment logic, and static publishing decisions, but they are not public pages by themselves.

## Purpose

The research system exists to prevent thin or doorway-style page generation. A location or service page should only move toward publishing when there is a real reason for it to exist, such as:

- clear buyer intent
- confirmed partner coverage
- researched provider coverage
- event demand or venue density
- meaningful geography or logistics context
- high lead value
- enough source material to write useful, distinct content

No web scraping is performed by this folder or by the validator.

## Folder Map

- `schemas/` defines the JSON contracts.
- `partners/` stores partner service matrix records.
- `providers/` stores researched third-party provider records.
- `lead-routing/` stores routing rules.
- `sites/ice-rink-rentals/` stores Ice site research templates.
- `sites/roller-rink-rentals/` stores Roller site research templates.
- `scripts/validate-research.mjs` validates schema shape and business rules.

## Partner Service Matrix

Partner records describe confirmed fulfillment capabilities. They answer questions like:

- Which services are confirmed?
- Which states and cities are core coverage?
- Which states or cities might be possible after manual review?
- Is direct routing allowed?
- Are logo, name, and photo rights confirmed?
- What inventory, setup, insurance, and municipal event support are available?

The template at `partners/primary-party-rental-partner.template.json` is placeholder-only. It must not be treated as a real partner claim.

## Provider Research

Provider records are for manually researched third-party companies. They capture evidence, confidence, contact clarity, service fit, and routing fit.

The scoring model uses these maximums:

- portable rink service: 0 to 5
- clearly serves state/region: 0 to 5
- physical or nearby location presence: 0 to 4
- event rental industry relevance: 0 to 4
- website clarity/proof: 0 to 4
- commercial/event capacity: 0 to 4
- response/contact quality: 0 to 3
- review/reputation signals: 0 to 3
- fit for lead routing: 0 to 3

The total maximum provider score is 35.

## State Research

State research records summarize market and fulfillment readiness for a state. They should include target metros, target cities, event demand zones, major venue types, seasonal notes, logistics notes, and provider coverage notes.

Research statuses are:

- `not_started`
- `in_progress`
- `provider_research_complete`
- `page_map_ready`
- `approved_for_content`
- `paused`

State records should not move to `approved_for_content` until there are page recommendations with enough unique value and routing clarity.

## Page Recommendation Scoring

Page recommendation records decide whether a page should exist before it is written.

The page score uses these categories:

- search volume demand: 0 to 5
- supplier coverage: 0 to 5
- event/location density: 0 to 5
- lead value: 0 to 5
- unique intent: 0 to 5
- content depth possible: 0 to 5

The total maximum page score is 30. The validator warns when `publishRecommended` is true below the current threshold of 20.

Pages with `research_only_until_provider_confirmed` should normally be `noindexRecommended: true` and should not be marked Google Ads eligible.

## Fulfillment Status

Supported fulfillment statuses are:

- `direct_partner_available`
- `partner_network_or_researched_provider`
- `research_only_until_provider_confirmed`

These statuses should influence page copy, public disclosure, sitemap inclusion, Google Ads readiness, and lead routing.

## Lead Routing Modes

Supported routing modes are:

- `send_to_primary_partner`
- `manual_review_then_provider_match`
- `researched_provider_match`
- `unmet_demand_followup`

Fallback actions are:

- `store_for_manual_review`
- `send_to_primary_partner`
- `match_to_researched_provider`
- `mark_unmet_demand`
- `do_not_route`

Direct partner routing requires a confirmed partner. Researched provider routing requires provider IDs and evidence.

## How This Feeds CMS Pages

Future page-generation work should use this flow:

1. Create or update partner/provider/state research records.
2. Validate research data.
3. Approve page recommendations based on score and fulfillment readiness.
4. Generate or draft CMS pages using the approved recommendation.
5. Review/edit page content in the admin editor.
6. Publish approved pages in Cosmos/Pumpkin CMS.
7. Snapshot CMS content for static publishing.
8. Build and validate static output.

Cosmos/Pumpkin CMS remains the editable content store. Research JSON is the planning and approval layer. Static output remains the public deployment artifact.

## Validation

Run:

```powershell
node research/scripts/validate-research.mjs
```

The validator checks:

- JSON syntax
- required fields
- enum values
- scoring ranges
- total score consistency
- page recommendation rules
- lead routing consistency
- fulfillment disclosure warnings
- placeholder-looking records that are not marked template/example

Warnings are allowed during research. Errors should be fixed before a record feeds page generation.

## Phase 6C Direction

Phase 6C should create the first real state research package. That work should choose one site and one state, then add manually reviewed provider/partner notes, page recommendations, and lead routing drafts. It should still avoid creating production pages until the recommendations are reviewed.
