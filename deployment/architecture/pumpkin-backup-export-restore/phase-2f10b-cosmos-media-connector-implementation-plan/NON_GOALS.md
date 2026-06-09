# Non-Goals

Phase 2F-10B does not approve or perform any of the following:

- Cosmos export.
- Database export.
- Database import.
- Blob listing against live storage.
- Blob download.
- Blob copy.
- MediaAsset writes.
- CMS writes.
- Tenant creation.
- Protected config reads.
- Secret export.
- Encrypted escrow payload creation.
- Azure mutation.
- Cloudflare or DNS changes.
- Deployment.
- Email or Microsoft 365 changes.
- Search Console or indexing actions.
- Live-page publication.
- Git staging or commits.

## Protected Material

The future implementation must never read protected config or credential/cache files as a source of truth. Environment checks must be presence-only unless a later approval explicitly authorizes a read-only operation through a safe process environment.

## Standard Backup Boundary

The standard backup path must exclude real secrets. If encrypted escrow is later approved, it must remain a separate flow with explicit owner approval, separate manifest entries, separate access control, and separate validation.
