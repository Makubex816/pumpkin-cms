# V2.8.29 Carryforward

V2.8.29 completed non-delivery triage.

Carryforward findings:

- Primary root cause: `api_acceptance_without_persistence`.
- The static compat API generates an entry ID before delivery.
- In `dry-run` or `no-email`, the compat API returns success without persistence.
- In `graph`, the compat API can send email but still does not create a Pumpkin `FormEntry`.
- Only `pumpkin-api` mode forwards to Pumpkin API persistence.
- Admin reads Pumpkin API `/api/admin/{tenantId}/form-entries`, backed by tenant-scoped `FormEntry` storage.
- Tenant/site/form alignment did not explain the missing Admin row.
- The V2.8.26 entry ID aligns with `ice-rink-rentals` and `default-quote-request`.

Recommended carryforward:

Choose an explicit remediation mode. For V2.8.30 the selected mode is `admin-persistence-required`.
