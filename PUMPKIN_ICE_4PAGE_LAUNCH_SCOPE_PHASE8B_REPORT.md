# Pumpkin CMS Phase 8B - IceSkatingRinkRentals.com 4-Page Launch Scope / Customer-Facing Production Plan

Date: 2026-05-24

Branch: `feature/admin-page-editor-import-export`

## Summary

IceSkatingRinkRentals.com is now the primary launch focus.

RollerRinkRentals.com is secondary and paused. Roller should not receive content, deployment, or launch-planning work unless explicitly requested.

Phase 8B is a planning/report phase only. No CMS content was rewritten, no static package was regenerated, no Azure deployment was attempted, no Azure resource was created, and no Cloudflare/DNS/custom-domain/production cutover action was performed.

## Starting State

`git status --short --untracked-files=all` was clean at the start of Phase 8B.

Reviewed:

- `PUMPKIN_FINAL_STATIC_REGENERATION_RESCAN_PHASE7K_REPORT.md`
- `PUMPKIN_AZURE_DEFAULT_HOST_STAGING_PHASE8A_REPORT.md`
- `.static-release-dry-runs/2026-05-23-2250/static-publish-dry-run-manifest.json`
- `.static-release-dry-runs/2026-05-23-2250/STATIC_PUBLISH_DRY_RUN_SUMMARY.md`
- Ice CMS source snapshot page metadata from `apps/ice-rink-web/.static-content-snapshots/ice-rink-rentals/pages`

## Current Ice Technical Readiness

Fresh validated package:

- Run ID: `2026-05-23-2250`
- Ice release folder: `.static-release-dry-runs/2026-05-23-2250/ice-rink-rentals`
- File count: 44
- Content source: `cms-snapshot`
- Static artifact validator: passed
- Staging package validator: passed
- Release static output validator: passed
- `readyForManualUpload`: true
- Redirect count: 0

Current Ice package routes:

- `/`
- `/ice-rink-rentals`
- `/events-holiday-activations`
- `/contact`
- `/sitemap.xml`
- `/robots.txt`

Current Ice page-quality warnings:

| Category | Count | Affected routes |
| --- | ---: | --- |
| Manual workflow approval missing | 4 | `contact`, `events-holiday-activations`, `home`, `ice-rink-rentals` |
| `staticPublishing.needsRebuild` is true | 4 | `contact`, `events-holiday-activations`, `home`, `ice-rink-rentals` |

Current package caveat:

- Phase 8A proved the `2026-05-23-2250` package is technically valid for manual upload, but Azure staging execution was blocked because Azure CLI and SWA CLI were unavailable in the command environment.
- The next content goal is not immediate deployment; it is a polished 4-page Ice launch package.

## Current Ice CMS Page Baseline

| Current route | Page title | Current role | Launch action |
| --- | --- | --- | --- |
| `/` | Portable Ice Rink Rentals for Events | Homepage | Keep and expand into the primary broad-offer landing page |
| `/contact` | Request an Ice Rink Rental Quote | Quote/contact path | Keep and polish as the conversion page |
| `/ice-rink-rentals` | Portable Ice Rink Rentals | General service page | Reassess against 4-page scope; likely merge into homepage or repurpose as service areas |
| `/events-holiday-activations` | Ice Rink Rentals for Events and Holiday Activations | Event/activation page | Pause from primary 4-page launch or repurpose after content decision |

The proposed 4-page launch package does not automatically preserve every current route. The next content phase should explicitly decide whether current `/ice-rink-rentals` and `/events-holiday-activations` are repurposed, held out of navigation, redirected, or left published temporarily for staging review.

## Four-Page Launch Scope

Primary launch page set:

1. Homepage
2. Contact page
3. Service Areas page
4. One targeted city/location landing page

Recommended route structure:

| Page | Recommended route | Notes |
| --- | --- | --- |
| Homepage | `/` | Primary broad-offer page for IceSkatingRinkRentals.com |
| Contact page | `/contact` | Quote request and lead capture path |
| Service Areas page | `/service-areas` | Coverage and logistics hub |
| City/location page | `/ice-rink-rentals-{city-state}` or `/service-areas/{city-state}` | Specific city must be confirmed before final copy |

Route recommendation:

- Prefer `/service-areas` for the coverage hub.
- Prefer a flat city slug such as `/ice-rink-rentals-philadelphia-pa` if the city page is meant to rank as a standalone landing page.
- Prefer `/service-areas/{city-state}` only if the site will quickly expand into a structured service-area directory.
- Do not write final city-specific copy until the launch city is confirmed.

## Page 1 - Homepage

User intent:

- Understand whether portable ice rink rental is available for an event, activation, venue, school, municipality, or private organization.

Target audience:

- Event planners, municipal recreation teams, school/college event staff, venue operators, brand activation teams, holiday market organizers, and corporate event producers.

Offer positioning:

- Portable ice rink rental planning for temporary events, seasonal experiences, and venue activations.
- The page should explain what the service is, who it is for, and what a qualified request needs.

Primary CTA:

- Request an ice rink rental quote.

Trust/proof sections:

- Planning process and what happens after inquiry.
- Logistics readiness checklist: location, surface, dates, expected attendance, power/water/access needs if relevant.
- Use only claims that are supported by real business facts. Do not invent partner, client, coverage, safety, insurance, or testimonial claims.

SEO direction:

- Title direction: portable ice rink rentals for events.
- Meta description direction: summarize portable rink rental planning, event types, and quote request path.
- Avoid overpromising nationwide coverage or specific city service until confirmed.

Schema requirements:

- Organization or LocalBusiness/Service schema if accurate business identity details are confirmed.
- Service schema for portable ice rink rental.
- FAQ schema only for FAQ content that is visible on the page.

Internal links:

- Link to `/service-areas`.
- Link to selected city/location page once confirmed.
- Link to `/contact`.

Conversion goal:

- Quote CTA click leading to `/contact`.

## Page 2 - Contact Page

User intent:

- Request pricing, availability, or a planning conversation.

Target audience:

- Qualified prospects who know enough to inquire or need help scoping event feasibility.

Offer positioning:

- Clear quote request flow that asks for event basics without forcing the customer to know technical rink details.

Primary CTA:

- Submit quote request form.

Trust/proof sections:

- What information helps produce a useful quote.
- Response expectation, if operationally true.
- Privacy/data-use reassurance without legal overreach.

SEO direction:

- Title direction: request an ice rink rental quote.
- Meta description direction: ask for event date, location, venue type, and attendee estimate.

Schema requirements:

- ContactPage schema.
- Service schema reference if supported by the implementation.
- FAQ schema only if visible contact FAQs are included.

Form/contact path:

- Keep form type as quote request.
- Required fields should cover name, email, event date/date range, city/state/venue, expected attendance, and message/details.
- Optional fields can include phone, venue type, surface/access notes, and event type.
- The static form endpoint decision must be made before production; staging can show the expected static endpoint limitation only if clearly documented.

Internal links:

- Back to homepage.
- Link to service areas.
- Link to city page once confirmed.

Conversion goal:

- `quote_form_submit`.

## Page 3 - Service Areas Page

User intent:

- Determine whether the company may support their city, venue, or region before submitting a quote request.

Target audience:

- Prospects searching by region, event planners comparing feasibility, and local organizers who need coverage clarity.

Offer positioning:

- Service-area and logistics hub for portable ice rink rental planning.
- It should clarify that availability depends on event scope, access, season, timing, and operational feasibility.

Primary CTA:

- Ask about availability in your area.

Trust/proof sections:

- Coverage model and planning constraints.
- What makes a location feasible.
- Clear statement that final availability is confirmed through quote review.

SEO direction:

- Title direction: ice rink rental service areas.
- Meta description direction: coverage planning for portable ice rink rentals by city/region with quote request path.

Schema requirements:

- CollectionPage or WebPage schema.
- Service schema with `areaServed` only if the actual service area is approved.
- Breadcrumb schema if supported.

Internal links:

- Link to homepage.
- Link to `/contact`.
- Link to the confirmed city/location page.

Conversion goal:

- Quote CTA click or service-area inquiry click.

Content caution:

- Do not list cities, states, or regions as served unless approved. If a city is not confirmed, use neutral availability language and ask users to inquire.

## Page 4 - Targeted City/Location Landing Page

Status:

- Specific city/location must be confirmed before final copy is written.

User intent:

- Find portable ice rink rental availability for a specific city or metro area.

Target audience:

- Local event planners, city recreation teams, venue managers, schools, holiday event organizers, and corporate/local activation planners in the confirmed area.

Offer positioning:

- City-specific planning page that connects the broad portable rink rental offer to local event use cases, venue logistics, and inquiry path.

Primary CTA:

- Request availability for the confirmed city/location.

Trust/proof sections:

- Local planning considerations: venue surface, access, seasonality, weather, parking/loading, crowd flow, event dates.
- Use only factual, approved local references. Do not invent local clients, installed rinks, partner venues, testimonials, or coverage claims.

SEO direction:

- Title direction: ice rink rentals in `{City, State}`.
- Meta description direction: portable ice rink rental planning for events in `{City/Metro}`, with quote request.
- Use one confirmed primary keyword and avoid stuffing city variants.

Schema requirements:

- Service schema with accurate `areaServed` only after the city is approved.
- Breadcrumb schema.
- FAQ schema only for visible FAQs.

Internal links:

- Link to homepage.
- Link to `/service-areas`.
- Link to `/contact`.

Conversion goal:

- City-specific quote CTA click or quote form submit.

Required confirmation before writing:

- City and state/metro name.
- Whether the company is willing to represent availability in that city.
- Any approved local proof or logistics notes.
- Whether the page should be indexed at launch.

## Design And UX Expectations

Overall:

- Customer-facing, production-polished, not a technical demo.
- Clear above-the-fold offer, audience, and quote CTA.
- Strong mobile readability and tap targets.
- No local/dev/proof/test/staging language in visible customer copy.
- No invented proof claims.
- No unsupported provider, partner, or fulfillment claims.
- No confusing duplication between homepage and service page.

Navigation:

- Keep the primary navigation small: Home, Service Areas, Contact.
- Add the city/location page to navigation only if it is central to the launch strategy; otherwise link it contextually from Service Areas and Homepage.

Content hierarchy:

- Homepage explains the service and routes users.
- Service Areas answers coverage/availability questions.
- City page captures local intent.
- Contact page converts qualified inquiries.

## Form And Contact Requirements

Required before production:

- Decide whether the static form endpoint is configured or intentionally disabled.
- If configured, verify staging endpoint, CORS, tenant routing, Lead Inbox receipt, and no real email notifications.
- If not configured, the form must show a truthful limitation/error and should not pretend success.
- Avoid putting tenant API keys or secrets in static frontend code.

Recommended contact fields:

- Name
- Email
- Phone
- Event date/date range
- City/state and venue
- Venue type
- Expected attendance
- Event type
- Message/details

Routing:

- Contact page should be the canonical lead capture page.
- Homepage, Service Areas, and City page should all route users to `/contact`.

## Ready For Azure Staging

The 4-page Ice launch package is ready for Azure default-host staging when:

- CMS source contains exactly the approved launch route set or a documented temporary route exception.
- Homepage, Contact, Service Areas, and confirmed City page are published and included in sitemap if intended for staging review.
- Any old route not in the 4-page launch scope is explicitly paused, redirected, noindexed, or documented as temporarily present.
- Static snapshot/export/dry-run is regenerated from CMS.
- Static artifact validators pass.
- Staging package validator passes.
- Release manifest marks Ice `readyForManualUpload: true`.
- Page-quality warnings are either resolved or explicitly accepted for staging.
- No visible local/proof/dev/test/staging copy remains.
- No secrets or protected config are present in output.
- Static form behavior is documented for staging.
- Azure default-host deployment tooling/resource blocker from Phase 8A is resolved.

## Ready For Production And Indexing

The 4-page Ice launch package is ready for production/indexing when:

- Final page copy is approved for all four pages.
- City/location page target is confirmed and accurate.
- Workflow approval is set for the intended public pages.
- `staticPublishing.needsRebuild` is cleared by a final approved build/publish flow.
- Final static package is regenerated after all CMS content changes.
- Validators pass.
- Sitemap contains only intended indexable URLs.
- Robots policy is reviewed.
- Canonical URLs are correct for production.
- Schema is accurate and does not contain unsupported service-area or proof claims.
- Contact form behavior is production-approved.
- No staging/default-host URLs are submitted to search engines.
- Azure staging default-host validation passes.
- Production DNS/Cloudflare/cutover is approved separately.

## Recommended Next Phases

Phase 8C - Ice CMS Content Rewrite Plan:

- Convert the Phase 8B scope into exact CMS page changes.
- Decide which current Ice routes are kept, repurposed, paused, redirected, or noindexed.
- Confirm the city/location target before writing final city copy.

Phase 8D - Ice 4-Page CMS Content Implementation:

- Update CMS pages only after approval of the plan.
- Do not touch Roller.
- Do not deploy.

Phase 8E - Ice 4-Page Static Regeneration And Validation:

- Regenerate Ice static package from CMS.
- Verify route set, sitemap, metadata, schema, form behavior, and validators.

Phase 8F - Ice Azure Default-Host Staging Execution:

- Resolve Azure/SWA tooling and credential blocker.
- Deploy only Ice to Azure default-host staging.
- Validate the default-host staging URL.

Phase 8G - Ice Production Cutover Readiness:

- Prepare production cutover checklist after staging signoff.
- Keep DNS/Cloudflare/custom-domain changes as separately approved actions.

## No-Go Confirmations

- No CMS content was rewritten.
- No CMS Theme data was patched.
- No CMS Page data was patched.
- No static regeneration was run.
- No Azure resource was created.
- No Azure deployment was run.
- No Cloudflare change was made.
- No DNS change was made.
- No custom domain was configured.
- No production page was created.
- No provider/state/company research file was created.
- No hard delete was performed.
- No protected config file was modified.
- RollerRinkRentals.com was not advanced.

## Checks

Completed:

- `git diff --check`: passed.
- Direct trailing whitespace scan for this report: passed.
- Protected config/workflow/generated-folder status check: passed.
- Targeted secret scan for this report: passed.
- No generated static folders staged: passed.
- `node --check` for changed `.mjs` files: not applicable; no `.mjs` files changed.
