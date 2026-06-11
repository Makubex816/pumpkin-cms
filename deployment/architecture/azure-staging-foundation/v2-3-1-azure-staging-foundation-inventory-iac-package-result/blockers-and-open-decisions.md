# Blockers And Open Decisions

## Active Blockers

| Blocker | Status | Required resolution |
| --- | --- | --- |
| Real OLM staging provider target | blocked | Approve or create a non-production staging Cosmos target. |
| `OLM_STAGING_PROVIDER_PROFILE_ID` | missing | Register a staging provider profile candidate. |
| `OLM_STAGING_PROVIDER_TYPE` | missing | Confirm provider type, expected `azure-cosmos-nosql`. |
| `OLM_STAGING_PROVIDER_MODE` | missing | Approve exact scoped staging live-write mode string. |
| `OLM_STAGING_RESOURCE_SCOPE` | missing | Approve staging resource group/account scope. |
| `OLM_STAGING_ACCOUNT_OR_HOST` | missing | Approve Cosmos account or host. |
| `OLM_STAGING_DATABASE_OR_NAMESPACE` | missing | Approve staging database or namespace. |
| `OLM_STAGING_RBAC_OR_AUTH_MODE` | missing | Approve Entra/RBAC data-plane access model. |
| `OLM_STAGING_IDENTITY_OR_SESSION_TYPE` | missing | Approve operator session or managed identity model. |
| `OLM_STAGING_READBACK_METHOD` | missing | Approve tenant/site/batch readback method. |
| `OLM_STAGING_ROLLBACK_METHOD` | missing | Approve rollback method tied to `olbatch_b08e184fdc6565aa`. |

## Open Decisions

- Whether to create new dedicated PumpkinCMS staging resources or map to an existing safe non-production staging scope.
- Whether the first write uses an operator Azure CLI session or a managed identity.
- Whether a future phase should run Azure `what-if` before actual creation.
- Whether the Cosmos account should use serverless or provisioned throughput for staging.
- Whether Log Analytics/Application Insights are created with the first foundation or added in a later hardening pass.
- Budget amount and owner.

## Closed By V2.3.1

- A no-deploy resource foundation proposal now exists.
- A Bicep draft and output contract now exist.
- A redacted read-only Azure inventory summary now exists.
- Resource Registry, Backup Center, Runtime QA, RBAC, Key Vault, and cost plans now exist.

