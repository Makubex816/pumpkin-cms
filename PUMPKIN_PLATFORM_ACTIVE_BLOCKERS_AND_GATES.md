# Pumpkin Platform Active Blockers And Gates

## Current V2 Gate Summary

| Gate | Status | V2 refs | Required unblock |
| --- | --- | --- | --- |
| Azure staging foundation inventory and IaC package | Complete | V2.3.1 / L07 / L09 / L11 / L12 | No-deploy package created; no Azure mutation performed. |
| Azure staging target finalization and deployment dry-run | Next | V2.3.2 / L07 / L09 / L11 / L12 | Finalize non-secret staging target/profile values and validate IaC without creation. |
| First scoped OLM staging write | Blocked | V2.2 / L08 / L12 | Canonical `OLM_STAGING_*` contract must pass. |
| OLM real staging provider target | Blocked | V2.2 / V2.3 / V2.5 | Non-secret target/resource values must be supplied, validated, and approved. |
| OLM readback/rollback | Blocked | V2.2 / V2.4 / V2.9 | Concrete methods must be approved and tied to `olbatch_b08e184fdc6565aa`. |
| Azure resource creation/mutation | Closed | V2.3 / L11 | Separate explicit approval required. |
| RBAC assignment | Closed | V2.3 / L11 / L12 | Separate explicit approval required. |
| Production database migration | Closed | V2.9 / L12 | Future explicit production migration approval only. |
| Production provider writes | Closed | V2.9 / L12 | Future explicit production write approval only. |
| CMS writes | Closed | L04 / L12 | Separate scoped approval required. |
| Deployment/indexing/publication | Closed | V2.8 / V2.9 / L15 | Separate deploy/index/publish approval required. |

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

- Legacy 2H Tracker v1 frozen value: `92 / 100`
- OLM approval manifest: `olapprove_508df3f03faa4f80`
- OLM first-write batch: `olbatch_b08e184fdc6565aa`
- Expected OLM staging package records: `48`
- OLM records written: `0`
- Real OLM write readback run: `false`
- V2.0 Azure resources created: `0`
- V2.0 Azure resources mutated: `0`
- V2.0 RBAC assignments: `0`
- V2.3.1 Azure resources created: `0`
- V2.3.1 Azure resources mutated: `0`
- V2.3.1 RBAC assignments: `0`
- V2.3.1 staging writes: `0`
