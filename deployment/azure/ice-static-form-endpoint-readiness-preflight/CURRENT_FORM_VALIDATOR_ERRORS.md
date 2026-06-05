# Current Form Validator Errors

Fresh checks were run on 2026-06-05 after a local Ice static export.

## Strict Validators

| Validator | Exit | Errors |
| --- | ---: | --- |
| `node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out apps/ice-rink-web/out` | 1 | 2 |
| `node deployment/static-azure/validate-staging-package.mjs --site ice-rink-rentals --folder apps/ice-rink-web/out` | 1 | 2 |

Exact remaining errors:

- `Static form endpoint is not configured for production/static deploy readiness.`
- `Static form endpoint/backend verification is missing; mailbox readiness is not app form readiness.`

These are global Ice strict readiness gates. They are not file-specific route errors.

## Snapshot Validator Warnings

`npm run validate:snapshot:ice` passed with warnings. Form warnings apply to pages with enabled form blocks:

| Page | Route | Form block | Warnings |
| --- | --- | --- | --- |
| `home` | `/` | yes | endpoint missing; endpoint/backend verification missing |
| `contact` | `/contact` | yes | endpoint missing; endpoint/backend verification missing |
| `service-areas` | `/service-areas` | no visible form block | no page-specific form endpoint warning |

## Current Env Presence

Values were not printed.

| Name | Current status |
| --- | --- |
| `NEXT_PUBLIC_STATIC_FORM_ENDPOINT` | missing |
| `STATIC_FORM_ENDPOINT` | missing |
| `NEXT_PUBLIC_STATIC_FORM_ACTION` | missing |
| `STATIC_FORM_ACTION` | missing |
| `STATIC_FORM_ENDPOINT_VERIFIED` | missing |
| `ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT` | missing |
| `ICE_RINK_RENTALS_LEAD_RECIPIENT` | missing |

## Ice Form Sources

Approved snapshot form blocks:

| Page | Block id | Form key | Static endpoint ref | Lead recipient ref | Source page |
| --- | --- | --- | --- | --- | --- |
| `home` | `homepage-quote-form` | `default-quote-request` | `ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT` | `ICE_RINK_RENTALS_LEAD_RECIPIENT` | `/contact` |
| `contact` | `contact-quote-form` | `default-quote-request` | `ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT` | `ICE_RINK_RENTALS_LEAD_RECIPIENT` | `/contact` |

Media readiness is not part of the remaining validator failure:

```text
local /media/ice-rink-rentals occurrences: 0
latestSnapshot mentions: 0
rendered local img src occurrences: 0
```

