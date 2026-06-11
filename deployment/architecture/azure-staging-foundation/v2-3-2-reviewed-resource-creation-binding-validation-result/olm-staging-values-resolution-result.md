# OLM_STAGING Values Resolution Result

No `OLM_STAGING_*` field is final execution-ready after V2.3.2 because no staging Azure resources were created and no provider profile was finalized.

## Final Resolved Values

| Field | Final value |
| --- | --- |
| none | none |

## Candidate Values Only

| Field | Candidate value | Status |
| --- | --- | --- |
| `OLM_STAGING_PROVIDER_PROFILE_ID` | `olm-staging-cosmos-nosql-v1` | candidate only; no repo-supported final profile registered |
| `OLM_STAGING_PROVIDER_TYPE` | `azure-cosmos-nosql` | design candidate only |
| `OLM_STAGING_PROVIDER_MODE` | `staging-live-write-approved` | future first-write approval only; not active |
| `OLM_STAGING_RESOURCE_SCOPE` | `rg-pumpkincms-stg-eastus-olm` or future resource ID | unresolved; group does not exist |
| `OLM_STAGING_ACCOUNT_OR_HOST` | `cosmos-pumpkincms-stg-olm01` or endpoint hostname | unresolved; account not created |
| `OLM_STAGING_DATABASE_OR_NAMESPACE` | `pumpkincms-olm-staging` | unresolved; database not created |
| `OLM_STAGING_RBAC_OR_AUTH_MODE` | `entra-rbac-cosmos-data-plane` | unresolved; no RBAC assignment |
| `OLM_STAGING_IDENTITY_OR_SESSION_TYPE` | `operator-azure-cli-session` or `managed-identity` | unresolved; no explicit final model |
| `OLM_STAGING_READBACK_METHOD` | `cosmos-nosql-tenant-site-batch-id-readback` | unresolved; target not created |
| `OLM_STAGING_ROLLBACK_METHOD` | `cosmos-nosql-first-write-batch-delete-or-restore-plan` | unresolved; target not created |

## Required Before First Write

- Create or approve the staging resource group.
- Deploy or approve the Cosmos staging account/database/containers.
- Finalize provider profile in a repo-supported format.
- Finalize RBAC/auth/session model.
- Validate readback and rollback methods against the created target.
- Keep `recordsWritten=0` until the separate OLM first-write approval.

