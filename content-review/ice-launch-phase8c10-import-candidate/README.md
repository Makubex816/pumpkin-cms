# Ice Phase 8C.10/8C.11 Import Candidate Prep Bundle

This folder is for IceSkatingRinkRentals.com only. RollerRinkRentals.com remains paused.

This is a review-only import-candidate prep package. No CMS import has happened, no live CMS Page or Theme record has changed, no static regeneration has run, and no deployment/DNS/Azure action is included.

## Source

Derived from the Phase 8C.7 review bundle:

- content-review/ice-launch-phase8c7-review-bundle/ice-homepage.design-system.template.json
- content-review/ice-launch-phase8c7-review-bundle/ice-contact.design-system.template.json
- content-review/ice-launch-phase8c7-review-bundle/ice-service-areas.design-system.template.json

## Pages Included

- Homepage: /
- Contact: /contact
- Service Areas: /service-areas

/service-areas remains canonical. /areas-served remains only a future alias/redirect candidate.

No targeted city/location page is included. The first city page must be created later after a specific target city, state, route, local claim, and indexability decision are approved.

## What Changed From 8C.7

- Safe non-secret lead recipient reference resolved to ICE_RINK_RENTALS_LEAD_RECIPIENT.
- Safe non-secret static contact endpoint reference resolved to ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT.
- Target-city placeholder copy was removed from import-candidate customer-facing page content.
- Empty media URL/asset fields were replaced with structured MediaAsset requirement/reference objects.
- Phase 8C.11 added default contact/quote form definitions.
- The contact page now uses a visible `formBlock` section backed by `default-quote-request`.
- Unknown phone, email, service-area, region, target-city, and final media values remain blockers.

## Default Form

- Primary contact page form key: `default-quote-request`
- Visible section id: `contact-quote-form`
- Static endpoint reference: `ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT`
- Lead recipient reference: `ICE_RINK_RENTALS_LEAD_RECIPIENT`

See `DEFAULT_CONTACT_FORM.md` plus the two form definition JSON files. These contain reference names only, not secrets.

## Readiness

Ready for human review: yes.

Ready for CMS import: no.

Ready for production/indexing: no.
