# Ice Launch Phase 8C.6 Design-System Template Package

This folder is a review-only package for IceSkatingRinkRentals.com.

RollerRinkRentals.com remains paused and is not advanced by this package.

## Files

- `ice-homepage.design-system.template.json`
- `ice-contact.design-system.template.json`
- `ice-service-areas.design-system.template.json`
- `ice-launch-template-package.design-system.json`

## Scope

Included pages:

- Homepage: `/`
- Contact page: `/contact`
- Service Areas page: `/service-areas`

Intentionally excluded:

- Targeted city/location page. No target city/location was confirmed in the reviewed reports.
- RollerRinkRentals.com content, deployment, or launch planning.

## Route Decision

Use `/service-areas` as the canonical service-area page route.

Treat `/areas-served` as a planned redirect or alias candidate only after route review. Do not create a duplicate page for it.

## Review Status

These files are ready for human design/content review.

They are not ready for CMS import or production publishing because placeholders remain:

- `{{PRIMARY_PHONE}}`
- `{{PRIMARY_EMAIL}}`
- `{{PRIMARY_SERVICE_AREA}}`
- `{{PRIMARY_REGION}}`
- `{{TARGET_CITY}}`
- `{{TARGET_STATE}}`
- `{{TARGET_REGION}}`
- `{{TARGET_CITY_SLUG}}`
- `{{LEAD_RECIPIENT_REF}}`
- `{{STATIC_CONTACT_ENDPOINT_REF}}`

## Design-System Usage

The templates use Phase 8C.5 support for:

- approved class prefixes and Ice `ice-` classes
- section variants
- `customHtml`
- allowed rich HTML profiles
- scoped section CSS
- structured Contact block metadata instead of raw HTML forms

No `trustedEmbed` section is used because no approved public video or map URL is needed for this package.

## Import Warning

Do not import these files into CMS during Phase 8C.6.

Before import, run the admin import/export preflight, resolve placeholders, choose approved media assets, confirm form routing, and record reviewer approval.
