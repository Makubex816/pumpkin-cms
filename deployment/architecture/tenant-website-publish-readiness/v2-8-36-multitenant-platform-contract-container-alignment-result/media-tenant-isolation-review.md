# Media Tenant Isolation Review

Live media carryforward:

- Storage account: `iceskatingmedia`
- Container: `ice-rink-rentals-media`
- Prefix: `ice-rink-rentals/assets/`
- Public base: `https://iceskatingmedia.blob.core.windows.net/ice-rink-rentals-media`

Source behavior:

- Admin media routes use `/api/admin/{tenantId}/media-assets`.
- Media metadata source uses `MediaAsset` with tenant-scoped reads/writes.
- Media upload passes the route tenant ID to storage service.
- `MediaAsset` container now exists with `/tenantId`.

Result:

- Ice media is tenant-separated by live storage container/prefix mapping.
- Metadata tenant isolation is now aligned at Cosmos container level.
- Future tenants need explicit media profile allocation before publish or upload.
