# Business Values Resolution

No prompt-approved final business values were provided in Phase 8C.13 beyond the safe constants listed below. Values marked `TBD` remain unresolved and were not invented.

## Resolved Safe Constants

| Item | Approved Value | Status | Blocks CMS Import | Blocks Staging | Blocks Production/Indexing | Reason |
| --- | --- | --- | --- | --- | --- | --- |
| Tenant ID | `ice-rink-rentals` | resolved | no | no | no | Safe tenant identifier. |
| Site key | `ice-rink-rentals` | resolved | no | no | no | Safe site identifier. |
| Domain | `iceskatingrinkrentals.com` | resolved | no | no | no | Approved launch domain. |
| Canonical service route | `/service-areas` | resolved | no | no | no | Phase 8B/8C route decision. |
| Lead recipient ref | `ICE_RINK_RENTALS_LEAD_RECIPIENT` | resolved | no | no | no | Non-secret reference name only. |
| Static endpoint ref | `ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT` | resolved | no | no | no | Non-secret reference name only. |
| Default quote form key | `default-quote-request` | resolved | no | no | no | Phase 8C.11 form system. |

## Unresolved Business Values

| Item | Approved Value | Status | Blocks CMS Import | Blocks Staging | Blocks Production/Indexing | Reason |
| --- | --- | --- | --- | --- | --- | --- |
| Approved public phone | TBD | unresolved | yes | yes | yes | Current launch blockers require a final phone display/omit decision. |
| Approved public email | TBD | unresolved | yes | yes | yes | Current launch blockers require a final email display/omit decision. |
| Display public email on site | TBD | unresolved | yes | yes | yes | Need approval whether email appears publicly or remains form-only. |
| Legal/business display name | TBD | unresolved | yes | yes | yes | Needed for contact/footer/schema/legal review. |
| Primary service area wording | TBD | unresolved | yes | yes | yes | Needed before public service-area claims or schema can be final. |
| Primary region wording | TBD | unresolved | yes | yes | yes | Needed before regional grouping is final. |
| Approved quote CTA wording | TBD | unresolved | yes | yes | yes | Draft copy exists, but human approval is not recorded. |
| Approved target city/state for future city page | TBD | unresolved | no | no | no for current 3-page package | Blocks future city page creation only. |
| Approved local media source folder | TBD | unresolved | yes | yes | yes | No approved media files or MediaAsset IDs were provided. |

## Phone / Email Policy

- The contact page can technically render and submit through the visible form without public phone or public email values.
- CMS import should remain blocked until there is explicit approval to either display approved phone/email values or intentionally omit them.
- Public email must not be included in schema unless an approved public email and display policy exist.
- Public phone must not be included in schema unless an approved public phone and display policy exist.
- No fake phone or email is inserted in this package.

## Legal / Service-Area Policy

- Legal/business display name remains unresolved.
- Primary service-area wording remains unresolved.
- Primary region wording remains unresolved.
- Public schema should remain conservative until these values are approved.
