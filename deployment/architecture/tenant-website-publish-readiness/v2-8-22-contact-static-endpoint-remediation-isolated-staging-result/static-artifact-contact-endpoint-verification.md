# Static Artifact Contact Endpoint Verification

Artifact:

`apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260625222736/repo/apps/ice-rink-web/out`

Route files:

- `/index.html`: present
- `/contact/index.html`: present
- `/service-areas/index.html`: present

Contact serialization check:

| Assertion | Result |
| --- | --- |
| `contact/index.html` exists | pass |
| `contact/index.txt` exists | pass |
| Serialized static endpoint is `/api/static-contact` | pass |
| `contact@iceskatingrinkrentals.com` present | pass |
| `hello@iceskatingrinkrentals.com` absent | pass |
| `/api/contact` absent from `contact/index.txt` | pass |

Strict validator note:

The strict static output and staging package validators now passed the static form gate, but still failed local static integrity on the known non-contact legacy media-origin policy. This is the same carried-forward validator mismatch described in V2.8.21 for the V2.8.19H approved Azure Blob media source.
