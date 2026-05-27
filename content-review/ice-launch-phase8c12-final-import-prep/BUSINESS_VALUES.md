# Business Values Intake

Primary site: IceSkatingRinkRentals.com.

RollerRinkRentals.com remains paused.

Do not insert fake public business values. Values below are unresolved unless explicitly marked resolved.

## Resolved Safe Constants

| Item | Value | Status | Blocks CMS Import | Blocks Production | Notes |
| --- | --- | --- | --- | --- | --- |
| Tenant ID | `ice-rink-rentals` | resolved | no | no | Safe tenant identifier. |
| Site key | `ice-rink-rentals` | resolved | no | no | Safe site identifier. |
| Domain | `iceskatingrinkrentals.com` | resolved | no | no | Launch domain. |
| Homepage route | `/` | resolved | no | no | Canonical homepage route. |
| Contact route | `/contact` | resolved | no | no | Contact/quote route. |
| Service areas route | `/service-areas` | resolved | no | no | Canonical service-area route. |
| Lead recipient ref | `ICE_RINK_RENTALS_LEAD_RECIPIENT` | resolved | no | no | Non-secret reference name only. |
| Static endpoint ref | `ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT` | resolved | no | no | Non-secret reference name only. |
| Default quote form key | `default-quote-request` | resolved | no | no | Primary contact page form. |

## Unresolved Business Values

| Item | Value | Status | Blocks CMS Import | Blocks Production | Notes |
| --- | --- | --- | --- | --- | --- |
| Primary public phone | not confirmed | unresolved | yes | yes | No fake phone number may be inserted. |
| Primary public email | not confirmed | unresolved | yes | yes | No fake public email may be inserted. |
| Public email display policy | not confirmed | unresolved | yes | yes | Must decide whether email is displayed or hidden behind the form. |
| Primary service area wording | not confirmed | unresolved | yes | yes | Needed before public service claims or schema are production-ready. |
| Primary region wording | not confirmed | unresolved | yes | yes | Needed before region grouping is final. |
| Legal/business display name | not confirmed | unresolved | yes | yes | Needed for final footer/contact/schema review. |
| Quote/contact CTA language | current draft copy only | unresolved | yes | yes | Human approval required before CMS import. |
| Human approval status | not approved | unresolved | yes | yes | Content, design, SEO/schema, operations/form, and technical approvals are missing. |
| Target city/state | not confirmed | unresolved | no | yes | No city page is created in this phase. |

## Contact Policy

- The visible quote form is required on `/contact`.
- The form can work without displaying a public phone or public email.
- `ICE_RINK_RENTALS_LEAD_RECIPIENT` is an internal non-secret reference name, not a public email address.
- Real recipient routing and endpoint URLs must be configured outside page JSON.
- Public phone and email remain blocked until approved.
