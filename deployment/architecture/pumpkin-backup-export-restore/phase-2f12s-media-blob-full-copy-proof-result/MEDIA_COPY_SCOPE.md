# Media Copy Scope

Approved source:

- Storage account: `iceskatingmedia`
- Resource group: `rg-ice-production-media`
- Container: `ice-rink-rentals-media`
- Prefix: `ice-rink-rentals/assets/`
- Access mode: Azure AD/RBAC read-only data-plane access

Approved media result:

| Field | Result |
| --- | ---: |
| Expected blobs | 9 |
| Copied blobs | 9 |
| Expected bytes | 22,639,448 |
| Copied bytes | 22,639,448 |
| Approved content type | `image/png` |
| Approved extension | `.png` |

Out of scope:

- Storage mutation, upload, delete, tier change, metadata write, or restore.
- Storage keys/listKeys.
- Connection strings.
- SAS generation.
- Protected config reads.
- CMS writes or MediaAsset writes.
- Cosmos writes.
- Deployment, Search Console/indexing, or live-page publication.
