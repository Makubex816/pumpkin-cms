# Route Output Audit

## Approved Routes

Approved production route set:

- `/`
- `/contact`
- `/service-areas`

Required CMS slugs:

- `home`
- `contact`
- `service-areas`

## Current Snapshot

The current CMS discovery returned six pages. The local Ice snapshot now filters to the approved slugs only:

- `home`
- `contact`
- `service-areas`

Excluded discovered slugs:

- `events-holiday-activations`
- `ice-rink-rentals`
- `phase-5a-csv-import-54754949`

All three approved slugs are published, approved for publish, and included in sitemap metadata.

## Fresh Static Output

No fresh static route output was produced. The command stopped during `snapshot:cms:ice` before static build/generation.

Static route output ready: no.

## Snapshot Content Checks

| Check | Result |
| --- | --- |
| snapshot slugs exactly approved set | yes |
| `contactus@` | absent |
| preview route markers | absent |
| draft-only notes in revision metadata | present |
| `noindex` on approved pages | present on `home` and `service-areas` |
| East Coast wording | present |
| local `/media/...` URLs | present |
| base64 image payloads | not detected in compact scan |
| fake placeholder image URLs | not detected in compact scan |

## Existing Stale Output

`apps/ice-rink-web/out` was rejected as stale/wrong-site output:

- missing `service-areas/index.html`
- contains Roller-domain references
- static form endpoint missing/unverified
- noindex present

`apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out` was rejected as stale Ice output:

- missing `service-areas/index.html`
- obsolete `ice-rink-rentals/index.html` present
- obsolete `events-holiday-activations/index.html` present
- static manifest missing `service-areas`
- static manifest contains obsolete Ice slugs
- static form endpoint missing/unverified

No stale output was accepted.
