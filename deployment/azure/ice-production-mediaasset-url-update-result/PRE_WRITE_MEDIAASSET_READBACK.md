# Pre-Write MediaAsset Readback

Date: 2026-06-05

## Result

Pre-write MediaAsset readback failed before any write.

```text
GET /api/admin/{tenantId}/media-assets/{id}: records not readable with current admin auth
GET /api/admin/{tenantId}/media-assets: HTTP 401
```

Authentication diagnostic:

```text
PUMPKIN_ADMIN_JWT: PRESENT
JWT shape: raw-like
JWT segments: 3
JWT expiry status: expired-or-missing
tenant claim present: yes
role claim present: yes
```

The raw JWT value was not printed.

## Consequence

The run stopped before MediaAsset writes because the approved records could not be safely read back and tenant-verified.

No MediaAsset ID, page, theme, form, Cloudflare, Azure, deployment, email/Microsoft 365, or Roller mutation was performed.
