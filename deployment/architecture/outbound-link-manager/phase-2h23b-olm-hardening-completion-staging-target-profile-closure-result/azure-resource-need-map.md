# Azure Resource Need Map

This is a resource need map only. No Azure resource was created, mutated, queried for keys, or assigned RBAC in this pass.

| Future value | Supplied by | Notes |
| --- | --- | --- |
| `OLM_STAGING_RESOURCE_SCOPE` | Azure/resource foundation review | Non-secret resource group, account scope, or provider scope. |
| `OLM_STAGING_PROVIDER_TYPE` | provider registry and resource foundation | Example class: Cosmos/native provider or another approved staging provider type. |
| `OLM_STAGING_ACCOUNT_OR_HOST` | Azure/resource foundation review | Non-secret account or host identifier only. |
| `OLM_STAGING_DATABASE_OR_NAMESPACE` | Azure/resource foundation review | Non-secret database or namespace only. |
| `OLM_STAGING_RBAC_OR_AUTH_MODE` | RBAC/session validation | Mode label only; no key, token, SAS, or connection string. |
| `OLM_STAGING_IDENTITY_OR_SESSION_TYPE` | RBAC/session validation | Identity/session type only; no credential value. |
| `OLM_STAGING_READBACK_METHOD` | provider readback registry | Must be scoped to approved tenant/site and record IDs. |
| `OLM_STAGING_ROLLBACK_METHOD` | rollback method registry | Must be tied to `olbatch_b08e184fdc6565aa`. |

Future Azure foundation review should decide whether existing resources supply these values or whether a separate approved resource foundation phase is needed. That review must remain no-mutation unless a later approval explicitly authorizes creation or role changes.

