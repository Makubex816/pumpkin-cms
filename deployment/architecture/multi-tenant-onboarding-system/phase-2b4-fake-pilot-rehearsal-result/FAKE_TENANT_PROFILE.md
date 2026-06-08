# Fake Tenant Profile

## Tenant

- display name: Example Event Rentals
- tenant ID: `example-event-rentals`
- site key: `example-event-rentals`
- CMS tenant slug: `example-event-rentals`
- business type: event rental services

## Domains

- primary domain: `exampleeventrentals.com`
- www domain: `www.exampleeventrentals.com`
- media domain: `media.exampleeventrentals.com`
- canonical host: `primary`

## Deployment Profile

- `static-azure-cloudflare-worker-graph`

This value is recorded in generated package metadata only. No deployment work was performed.

## Routes

Approved routes requested:

- `/`
- `/contact`
- `/service-areas`

Generated approved routes:

- `/`
- `/contact/`
- `/service-areas/`

Forbidden routes requested:

- `/preview`
- `/draft`
- `/old-event-rentals`

Generated forbidden routes:

- `/preview/`
- `/draft/`
- `/old-event-rentals/`
- `/old/`

The builder adds `/old/` as a default forbidden route.

## Forms

- form ID: `contact-form`
- delivery mode: `no-email`
- fake recipient email: `leads@exampleeventrentals.com`
- requested lead recipient ref in answers: `example-event-leads`

Current gap: generated `forms.json` does not emit `leadRecipientRef` because the approved validator schema does not include that field yet.

## Indexing

- default robots: `noindex,nofollow`
- sitemap policy: `disabled-until-final-gate`
- indexing final gate: `true`
- manual indexing approval: `blocked-until-final-review`
