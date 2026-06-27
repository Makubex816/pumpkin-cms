# V2.8.29 Carryforward

V2.8.29 classified the root cause as API acceptance without Admin-visible persistence.

Carryforward facts:

- The compat API generated a local entry ID before delivery.
- Dry-run/no-email accepted without persistence.
- Graph mode could send email but did not create Pumpkin `FormEntry` records.
- Admin reads Pumpkin API `/api/admin/{tenantId}/form-entries`.
- Admin reads tenant-scoped `FormEntry` storage, not Graph mail, static function memory, dry-run IDs, or provider inboxes.
- Tenant/site/form alignment did not reveal a primary mismatch.

