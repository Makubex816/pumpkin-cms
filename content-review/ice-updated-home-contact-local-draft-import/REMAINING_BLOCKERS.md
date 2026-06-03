# Remaining Blockers

Run blockers:

- Admin auth invalid; stopped before CMS writes.

Before retrying local draft import:

- Provide a fresh valid admin JWT through `PUMPKIN_ADMIN_JWT` or `$env:TEMP\pumpkin-admin-jwt.txt`.
- Re-run the guarded import; the temp JWT file has already been deleted after loading.

Before static regeneration or production/indexing:

- Complete successful local draft import/readback first.
- Static regeneration, production approval, deployment, DNS/email/provider changes, and Roller work remain out of scope.
