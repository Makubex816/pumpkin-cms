# Media Full-Copy Proof Summary

Status: complete

Source evidence: Phase 2F-12S media blob full-copy proof result.

Storage target:

| Field | Value |
| --- | --- |
| Account | `iceskatingmedia` |
| Resource group | `rg-ice-production-media` |
| Container | `ice-rink-rentals-media` |
| Prefix | `ice-rink-rentals/assets/` |
| Tenant key | `ice-rink-rentals` |
| Site key | `ice-rink-rentals` |

Media proof result:

| Field | Result |
| --- | --- |
| Status | `copied-and-validated` |
| Auth mode | Azure AD/RBAC |
| Expected blobs | 9 |
| Copied blobs | 9 |
| Expected bytes | 22,639,448 |
| Copied bytes | 22,639,448 |
| Content type | `image/png` |
| Extension | `.png` |
| Validation | passed |
| Blob map SHA-256 | `003593C262224A8875471BC5045ED8F049EB1F3BE16736CEEA44BC6BAF1A44EA` |

Bundle layout:

- Copied files use short deterministic SHA-256 paths under `media/blobs/ice-rink-rentals/`.
- Original Azure blob names remain in `media/blob-map/blob-map.json`.
- Maximum local bundle path length reported by 12S was 97 characters.

12T boundary:

No media/blob download was run in 12T. This summary consolidates prior approved 12S evidence only.
