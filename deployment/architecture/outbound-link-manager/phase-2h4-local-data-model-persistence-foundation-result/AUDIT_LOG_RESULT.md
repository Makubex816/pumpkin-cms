# Audit Log Result

Implemented local append-only audit log generation for:

- `scan_merged`
- `link_status_changed`
- `instance_status_changed`
- `policy_set`

Audit logs include:

- tenant/site scope;
- action;
- record type and id;
- local actor;
- reason;
- timestamp;
- before/after summary.

Proof store `local-store-policy-blocked` contains:

- audit logs: 2
- latest actions: `scan_merged`, `policy_set`

The separate lifecycle proof stores each contain their own status-change audit record.
