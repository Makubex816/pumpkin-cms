# Placeholder Resolution

## Resolved Safe Non-Secret References

- LEAD_RECIPIENT_REF -> ICE_RINK_RENTALS_LEAD_RECIPIENT
- STATIC_CONTACT_ENDPOINT_REF -> ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT
- tenantId -> ice-rink-rentals
- siteKey -> ice-rink-rentals
- domain -> iceskatingrinkrentals.com
- canonical service route -> /service-areas

## Still Unresolved Before CMS Import

- PRIMARY_PHONE: public phone display and tel-link policy are not confirmed.
- PRIMARY_EMAIL: public-safe email display is not confirmed.
- PRIMARY_SERVICE_AREA: approved service-area wording is not confirmed.
- PRIMARY_REGION: approved regional grouping is not confirmed.
- FINAL_IMAGE_ASSETS: MediaAsset records are not selected/uploaded.
- HUMAN_APPROVALS: content, design, SEO/schema, operations/form, and technical approval are not recorded.
- ADMIN_PREFLIGHT: admin import/export dry-run has not been run against this candidate.

## Removed From Customer-Facing Candidate Copy

- TARGET_CITY
- TARGET_STATE
- TARGET_REGION
- TARGET_CITY_SLUG

No city/location page is created in this phase. The first city page must wait for confirmed city, state, route, local claim, media, schema, and indexability decisions.

## Production Blockers

- Any unresolved public placeholder.
- Any unapproved media reference.
- Any unsupported service-area or city claim.
- Any unverified form behavior.
- Any failed static/staging validator.
