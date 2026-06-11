# Staging Target/Profile Worksheet

This worksheet is safe to commit because it records presence/status metadata only. It does not contain secret values.

| Required field | Current status | Source | Secret classification | Safe to commit | Operator action required |
| --- | --- | --- | --- | --- | --- |
| `OLM_STAGING_PROVIDER_PROFILE_ID` | missing | provider profile registry | identifier only; value redacted | yes | Supply approved real scoped staging write provider profile ID. |
| `OLM_STAGING_PROVIDER_TYPE` | missing | Source-of-Truth Control Layer or provider registry | non-secret provider type | yes | Supply concrete approved staging provider type. |
| `OLM_STAGING_PROVIDER_MODE` | missing | provider mode gate | non-secret mode label | yes | Supply scoped staging write mode; not `staging-simulated` and not `production-runtime`. |
| `OLM_STAGING_RESOURCE_SCOPE` | missing | Azure/resource foundation review | non-secret resource scope | yes | Supply non-secret staging resource group, provider scope, or account scope. |
| `OLM_STAGING_ACCOUNT_OR_HOST` | missing | Azure/resource foundation review | non-secret account/host name | yes | Supply non-secret staging account or host identifier. |
| `OLM_STAGING_DATABASE_OR_NAMESPACE` | missing | Azure/resource foundation review | non-secret database or namespace | yes | Supply non-secret database, namespace, or equivalent target. |
| `OLM_STAGING_RBAC_OR_AUTH_MODE` | missing | RBAC/session validation | auth mode only; no token value | yes | Supply approved RBAC/session mode without keys, connection strings, or SAS. |
| `OLM_STAGING_IDENTITY_OR_SESSION_TYPE` | missing | RBAC/session validation | identity/session type only | yes | Supply approved principal or session type without token value. |
| `OLM_STAGING_READBACK_METHOD` | missing | readback method registry | method name only | yes | Supply concrete readback method for target provider. |
| `OLM_STAGING_ROLLBACK_METHOD` | missing | rollback method registry | method name only | yes | Supply rollback method tied to `olbatch_b08e184fdc6565aa`. |

Closure status: the worksheet is complete as a contract but incomplete as an execution target.

