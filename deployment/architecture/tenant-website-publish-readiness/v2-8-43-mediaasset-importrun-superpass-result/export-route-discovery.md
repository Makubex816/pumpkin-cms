# Export Route Discovery

Result: implemented.

Route:

`GET /api/admin/pages/{tenantId}/export?slug=<pageSlug>`

Behavior:

- Requires JWT authentication.
- Requires route tenant to match token tenant unless SuperAdmin.
- Requires explicit `slug`.
- Returns one page only.
- Package format: `pumpkin-cms-pages-export`.
- Schema version: `v2-8-43-page-only`.

