# CMS Import Blocker Matrix

| Blocker | Applies to | Current status | Required input | Blocks CMS import | Blocks local preview | Blocks production |
| --- | --- | --- | --- | --- | --- | --- |
| Real MediaAsset upload/selection | Homepage/contact/service areas | unresolved | supply media and approve MediaAsset creation/selection | yes | yes unless explicitly previewed with placeholders | yes |
| Homepage MediaAsset IDs | Homepage | null | upload/select homepage media | yes | yes unless placeholder preview approved | yes |
| Contact/service media decisions | Contact/service areas | unresolved | provide media or approve deferral/removal | yes | maybe | yes |
| Public phone policy | Sitewide/contact/schema | unresolved | final phone or approved omit decision | yes | yes | yes |
| Public email policy | Sitewide/contact/schema | unresolved | final email/display or form-only decision | yes | yes | yes |
| Legal/business display name | Sitewide/schema/footer | unresolved | approved display name | yes | yes | yes |
| Primary service-area wording | Homepage/service areas/schema | unresolved | approved wording | yes | yes | yes |
| Primary region wording | Homepage/service areas/schema | unresolved | approved wording or omit decision | yes | yes | yes |
| Quote CTA wording | Homepage/contact/service areas | unresolved | approved CTA wording | yes | maybe | yes |
| Homepage copy/design approval | Homepage | not approved | human approval | yes | yes | yes |
| Contact copy/form approval | Contact | not approved | human approval | yes | yes | yes |
| Service areas copy/route approval | Service areas | not approved | human approval | yes | yes | yes |
| SEO/meta approval | All three pages | not approved | human approval | yes | yes | yes |
| Schema approval | All three pages | not approved | human approval after business values | yes | yes | yes |
| Admin import/export preflight | CMS import package | not run | authorization and successful preflight | yes | yes | yes |

## Non-Blocker Safe Constants Already Resolved

- tenantId: `ice-rink-rentals`
- siteKey: `ice-rink-rentals`
- domain: `iceskatingrinkrentals.com`
- homepage route: `/`
- contact route: `/contact`
- service areas route: `/service-areas`
- lead recipient ref: `ICE_RINK_RENTALS_LEAD_RECIPIENT`
- static contact endpoint ref: `ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT`
- default quote form key: `default-quote-request`

