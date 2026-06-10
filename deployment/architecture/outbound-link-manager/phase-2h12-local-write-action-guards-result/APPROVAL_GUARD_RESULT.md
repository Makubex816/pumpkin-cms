# Approval Guard Result

The approval guard requires tenant/site scope, reason text, allowed role, bulk approval reference when applicable, and local/offline profile flags.

Guard outcomes:

- `TenantAdmin`, `SuperAdmin`, and `Operator` can run permitted local simulations when scoped correctly.
- `Viewer` and `BackupOperator` are blocked.
- production/live write flags are forced false by normalization.
- mismatched tenant/site requests are blocked.
- bulk requests without approval reference are blocked.

Evidence:

- `.tmp/phase-2h12/action-approve-review/ACTION_RESULT.json`: simulated
- `.tmp/phase-2h12/action-viewer-blocked/ACTION_RESULT.json`: blocked

The existing API write guard service still returns `OUTBOUND_LINK_WRITE_NOT_APPROVED`.
