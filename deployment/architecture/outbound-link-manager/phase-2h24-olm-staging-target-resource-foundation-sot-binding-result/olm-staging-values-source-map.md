# OLM_STAGING Values Source Map

| Field | Current status | Proposed source | First-write required | Notes |
| --- | --- | --- | --- | --- |
| `OLM_STAGING_PROVIDER_PROFILE_ID` | missing | Provider profile registry | yes | Must name an approved real scoped staging write profile. |
| `OLM_STAGING_PROVIDER_TYPE` | missing | Provider profile registry and resource foundation review | yes | Must be a concrete provider type; no production target assumption. |
| `OLM_STAGING_PROVIDER_MODE` | missing | Provider mode gate | yes | Proposed terminology: `staging-live-write-approved` or equivalent repo-supported scoped staging write mode. |
| `OLM_STAGING_RESOURCE_SCOPE` | missing | Operator-supplied non-secret resource foundation worksheet | yes | Resource group/scope/account scope; no secret material. |
| `OLM_STAGING_ACCOUNT_OR_HOST` | missing | Operator-supplied non-secret resource foundation worksheet | yes | Account or host identifier only. |
| `OLM_STAGING_DATABASE_OR_NAMESPACE` | missing | Operator-supplied non-secret resource foundation worksheet | yes | Database, namespace, or equivalent target only. |
| `OLM_STAGING_RBAC_OR_AUTH_MODE` | missing | RBAC/session review | yes | Mode label only; no token, key, connection string, or SAS. |
| `OLM_STAGING_IDENTITY_OR_SESSION_TYPE` | missing | RBAC/session review | yes | Principal/session type only; no credential values. |
| `OLM_STAGING_READBACK_METHOD` | missing | Readback method registry | yes | Must verify exactly scoped records by ID and count. |
| `OLM_STAGING_ROLLBACK_METHOD` | missing | Rollback method registry | yes | Must be tied to `olbatch_b08e184fdc6565aa`. |

The current source map supplies sources and acceptance rules, not actual execution values.

