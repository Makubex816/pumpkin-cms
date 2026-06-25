# Source Media Reference Readiness

The desired architecture remains:

- Image binaries live in Azure media resources, not as the long-term repo source of truth.
- The repo stores page source, media manifests, future Azure media URLs, alt text, route bindings, and validation docs.
- Canonical renamed upload-staging copies remain outside the repo until an approved Azure upload phase consumes them.

## Current Source Readiness

| Area | State |
| --- | --- |
| Azure public base URL | resolved |
| Final planned blob names | resolved |
| Future source URL values | derivable from final upload manifest |
| Source integration performed | no |
| Image binaries committed to repo | no |
| Contact fallback email source issue | still requires later replacement/override |

Future source integration should reference the final Azure blob URLs only after upload/readback succeeds and only in a separately approved source integration phase.
