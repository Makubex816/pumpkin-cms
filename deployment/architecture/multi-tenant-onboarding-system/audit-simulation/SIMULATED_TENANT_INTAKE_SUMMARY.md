# Simulated Tenant Intake Summary

| Field | Simulated value |
| --- | --- |
| tenant display name | Example Event Rentals |
| primary domain | `exampleeventrentals.com` |
| www domain | `www.exampleeventrentals.com` |
| media domain | `media.exampleeventrentals.com` |
| tenant ID placeholder | `example-event-rentals` |
| site key placeholder | `example-event-rentals` |
| tenant API key placeholder | `TENANT_API_KEY_RUNTIME_ONLY` |
| CMS tenant slug/key | `example-event-rentals` |
| business type | event rentals |
| approved routes | `/`, `/contact/`, `/service-areas/` |
| forbidden routes | `/preview/`, `/draft/`, `/old-home/` |
| paused/related tenants | none |
| form recipient | `contact@exampleeventrentals.com` |
| Microsoft 365 mailbox | `contact@exampleeventrentals.com` |
| Cloudflare account/zone | Example account, `exampleeventrentals.com` zone |
| Azure subscription | Example production subscription name only |
| Azure resource naming prefix | `example-event` |
| staging hostname | `example-event-staging.examplehost.net` |
| production cutover owner | TBD |
| indexing owner | TBD |
| analytics/tracking decision | deferred |
| legal/privacy reviewer | TBD |
| rollback owner | TBD |

## Usability Observation

The original intake templates were usable, but the owner assignments were too easy to leave vague. The audit adds explicit owner-contact schema and examples so the future wizard can enforce responsible roles.
