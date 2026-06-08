# Approvals JSON Expectations

`approvals.json` records the status of gate approvals. It is an audit record, not a command runner.

Required:

- `schemaVersion`
- `tenantId`
- `siteKey`
- `approvals`
- `hardStops`

Required per approval:

- `gate`
- `status`
- `ownerRole`
- `approvedBy`
- `approvedDate`
- `scope`
- `excludedSystems`

Allowed approval status values:

- `pending`
- `approved`
- `rejected`
- `accepted-with-risk`

External mutation is still blocked unless a later operator/tool explicitly verifies the approval and the active task authorizes that exact gate.
