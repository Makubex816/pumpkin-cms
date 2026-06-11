# OLM_STAGING Values Source Map

This map turns the unresolved OLM staging contract into concrete non-secret sources. Values remain unresolved until a future approved resource/profile phase confirms them.

| Field | Current status | Proposed safe source | Proposed value shape | First-write required |
| --- | --- | --- | --- | --- |
| `OLM_STAGING_PROVIDER_PROFILE_ID` | missing | Provider profile registry after resource plan approval | `olm-staging-cosmos-nosql-v1` or approved equivalent | yes |
| `OLM_STAGING_PROVIDER_TYPE` | missing | Provider profile registry and IaC outputs contract | `azure-cosmos-nosql` | yes |
| `OLM_STAGING_PROVIDER_MODE` | missing | Provider mode gate | `staging-live-write-approved` for first-write execution only | yes |
| `OLM_STAGING_RESOURCE_SCOPE` | missing | Approved staging resource group or Cosmos account scope | `resourceGroup:<approved-staging-rg>` or `cosmosAccount:<approved-account>` | yes |
| `OLM_STAGING_ACCOUNT_OR_HOST` | missing | IaC output or approved existing staging account | Cosmos account name or endpoint hostname, no credentials | yes |
| `OLM_STAGING_DATABASE_OR_NAMESPACE` | missing | IaC output or approved existing staging namespace | `pumpkin-olm-staging` or approved equivalent | yes |
| `OLM_STAGING_RBAC_OR_AUTH_MODE` | missing | RBAC/session review | `entra-rbac-cosmos-data-plane` or approved equivalent | yes |
| `OLM_STAGING_IDENTITY_OR_SESSION_TYPE` | missing | Identity plan | `operator-azure-cli-session` or `managed-identity` | yes |
| `OLM_STAGING_READBACK_METHOD` | missing | Readback method registry | `cosmos-nosql-tenant-site-batch-id-readback` | yes |
| `OLM_STAGING_ROLLBACK_METHOD` | missing | Rollback method registry tied to batch | `cosmos-nosql-first-write-batch-delete-or-restore-plan` | yes |

## Acceptance Rules

- `OLM_STAGING_PROVIDER_MODE` must never be inferred from local, fake, or staging-simulated profiles.
- `OLM_STAGING_RESOURCE_SCOPE` must identify a non-production staging scope only.
- `OLM_STAGING_ACCOUNT_OR_HOST` must be non-secret and must not be a connection string.
- `OLM_STAGING_DATABASE_OR_NAMESPACE` must be non-production.
- `OLM_STAGING_RBAC_OR_AUTH_MODE` must not require keys, `listKeys`, connection strings, or SAS.
- `OLM_STAGING_IDENTITY_OR_SESSION_TYPE` must not expose tokens, cookies, refresh tokens, or auth headers.
- `OLM_STAGING_READBACK_METHOD` must verify exactly the approved tenant/site/batch IDs and expected count.
- `OLM_STAGING_ROLLBACK_METHOD` must reference `olbatch_b08e184fdc6565aa` and produce an abort plan before execution.

