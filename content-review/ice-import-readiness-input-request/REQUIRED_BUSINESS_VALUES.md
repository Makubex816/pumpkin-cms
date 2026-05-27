# Required Business Values

Provide approved final values or an explicit omit/defer decision for each item.

| Item | Requested input | Current status | Blocks CMS import | Blocks production/indexing | Notes |
| --- | --- | --- | --- | --- | --- |
| Final public phone | Approved phone number or approved no-public-phone decision | unresolved | yes | yes | Do not use fake phone values. |
| Phone display policy | Display on homepage/contact/footer/schema, or hide publicly | unresolved | yes | yes | Form can work without public phone, but policy must be approved. |
| Final public email | Approved public email or approved no-public-email decision | unresolved | yes | yes | Do not use private routing addresses as public copy. |
| Email display policy | Display publicly, form-only, schema-only, or omit | unresolved | yes | yes | Lead routing remains via non-secret reference names. |
| Legal/business display name | Approved public business or brand display name | unresolved | yes | yes | Needed for footer/contact/schema review. |
| Primary service area wording | Approved customer-facing service area phrase | unresolved | yes | yes | Avoid unsupported geography claims. |
| Primary region wording | Approved region phrase or approved omit decision | unresolved | yes | yes | Needed for service-area copy/schema decisions. |
| Final quote CTA wording | Approved CTA copy | unresolved | yes | yes | Current defaults can be reviewed, but final wording needs approval. |
| Canonical service route | Confirm `/service-areas` | pending approval | yes | yes | `/areas-served` remains a future alias candidate only. |
| Future city route format | Confirm `/state-city` | pending approval | yes | yes | Examples: `/fl-orlando`, `/ny-new-york`, `/pa-philadelphia`. |
| Lead recipient reference | `ICE_RINK_RENTALS_LEAD_RECIPIENT` | resolved safe ref | no | no | Reference only; real routing is outside page JSON. |
| Static contact endpoint reference | `ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT` | resolved safe ref | no | no | Reference only; no endpoint secret is in page JSON. |

## Phone/Email Policy Decision Needed

Choose and document one policy:

- display both approved public phone and approved public email
- display approved public phone, keep email form-only
- keep both phone and email form-only
- another explicitly approved policy

Do not provide private routing credentials or secret values here.

