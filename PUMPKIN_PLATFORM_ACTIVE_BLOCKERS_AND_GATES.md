# Pumpkin Platform Active Blockers And Gates

## Current Hard Stops

| Gate | Status | Required unblock |
| --- | --- | --- |
| First scoped OLM staging write | Blocked | Canonical `OLM_STAGING_*` contract must pass and be bound to SOT. |
| OLM real staging provider target | Blocked | Non-secret target/resource values must be supplied through the 2H-24 worksheet and approved. |
| OLM readback/rollback | Blocked | Proposed methods from 2H-24 must be approved and bound to `olbatch_b08e184fdc6565aa`. |
| Production database migration | Closed | Future explicit production migration approval only. |
| Production provider writes | Closed | Future explicit production write approval only. |
| Azure resource creation/mutation | Closed in SOT-01 | Separate explicit Azure foundation approval required. |
| CMS writes | Closed | Separate scoped approval required. |
| Deployment/indexing/publication | Closed | Separate deployment, Search Console, and live publication approvals required. |

## Missing OLM Staging Contract

- `OLM_STAGING_PROVIDER_PROFILE_ID`
- `OLM_STAGING_PROVIDER_TYPE`
- `OLM_STAGING_PROVIDER_MODE`
- `OLM_STAGING_RESOURCE_SCOPE`
- `OLM_STAGING_ACCOUNT_OR_HOST`
- `OLM_STAGING_DATABASE_OR_NAMESPACE`
- `OLM_STAGING_RBAC_OR_AUTH_MODE`
- `OLM_STAGING_IDENTITY_OR_SESSION_TYPE`
- `OLM_STAGING_READBACK_METHOD`
- `OLM_STAGING_ROLLBACK_METHOD`

## Immutable Safety Facts

- OLM approval manifest: `olapprove_508df3f03faa4f80`
- OLM first-write batch: `olbatch_b08e184fdc6565aa`
- Expected OLM staging package records: `48`
- OLM records written: `0`
- Real OLM write readback run: `false`
- 2H-24 Azure resources created: `0`
- 2H-24 Azure resources mutated: `0`
- 2H-24 RBAC assignments: `0`
