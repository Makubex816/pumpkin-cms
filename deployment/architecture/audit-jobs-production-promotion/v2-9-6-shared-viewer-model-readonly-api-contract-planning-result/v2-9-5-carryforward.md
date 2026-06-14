# V2.9.5 Carryforward

V2.9.5 was committed as `529bbbf Implement V2.9.5 audit ledger admin navigation QA signoff`.

Carried forward:

- Admin route `/dashboard/audit-jobs`.
- Audit Jobs dashboard navigation entry.
- Admin route/source QA passed.
- Read-only safety markers passed.
- Disabled future actions passed.
- Filter/search/sort and detail view checks passed.
- Audit-ledger package validation passed.
- Runtime HTTP warning remains: local Next listeners timed out before serving the route.

V2.9.6 preserves the warning as `local_next_dev_server_listened_but_timed_out` in the read-only API envelope `source.runtimeHttpWarning` and `meta.runtimeHttpWarning`.
