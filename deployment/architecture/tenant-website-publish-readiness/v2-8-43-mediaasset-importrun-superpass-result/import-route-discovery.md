# Import Route Discovery

Result: implemented, live proof blocked.

Route:

`POST /api/admin/pages/{tenantId}/import`

Behavior:

- Requires JWT authentication.
- Requires route tenant to match token tenant unless SuperAdmin.
- Accepts exactly one page.
- Rejects cross-tenant page bodies.
- Supports `upsert`, `create-only`, and `update-only`.
- Saves an ImportRun audit record if import succeeds.

Live result:

- Single approved import attempt returned HTTP `409`.
- No second import attempt was made.

