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

The current CMS discovery returned six pages. The local Ice snapshot filters to the approved slugs only:

- `home`
- `contact`
- `service-areas`

Excluded discovered slugs:

- `events-holiday-activations`
- `ice-rink-rentals`
- `phase-5a-csv-import-54754949`

All three approved slugs are published and present in the local snapshot.

## Fresh Static Output

Fresh route output was produced by `npm run export:static:ice:cms`.

| Location | Routes |
| --- | --- |
| `apps/ice-rink-web/out` | `/`, `/contact`, `/service-areas` |
| `apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out` | `/`, `/contact`, `/service-areas` |

Static route output ready: yes.

## Output Checks

| Check | Result |
| --- | --- |
| snapshot slugs exactly approved set | yes |
| static output routes exactly approved set | yes |
| copied artifact routes exactly approved set | yes |
| deployable preview/obsolete route paths | 0 found |
| `/__preview/` route references | 0 found |
| `/draft-preview/` route references | 0 found |
| `contactus@` | absent |
| `data:image` markers | absent |
| `base64` image payload markers | absent |
| exact unsupported East Coast service claim patterns | absent |

Party Pros East Coast partner/resource wording remains in content and logo metadata; the compact check found no unsupported service-area claim phrases such as `East Coast service`, `serving the East Coast`, or `East Coast coverage`.

## Stale Output

No stale output was accepted. The current route proof came from the fresh successful export.
