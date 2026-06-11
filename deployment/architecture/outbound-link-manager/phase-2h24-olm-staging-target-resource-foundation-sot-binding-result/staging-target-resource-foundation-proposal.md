# Staging Target/Resource Foundation Proposal

This is a proposal only. No Azure resource was created, mutated, queried for keys, or assigned RBAC.

## Required For First Write

| Required foundation item | Purpose | Supplies |
| --- | --- | --- |
| Approved non-production scoped staging provider profile | Names the real OLM staging write profile | `OLM_STAGING_PROVIDER_PROFILE_ID` |
| Approved concrete provider type | Defines provider adapter and read/write semantics | `OLM_STAGING_PROVIDER_TYPE` |
| Approved scoped staging write mode | Allows a future write only under explicit gate | `OLM_STAGING_PROVIDER_MODE` |
| Approved non-secret resource scope | Identifies target scope without secrets | `OLM_STAGING_RESOURCE_SCOPE` |
| Approved non-secret account or host | Identifies the target endpoint host/account | `OLM_STAGING_ACCOUNT_OR_HOST` |
| Approved non-secret database or namespace | Identifies the OLM staging namespace | `OLM_STAGING_DATABASE_OR_NAMESPACE` |
| Approved RBAC/session mode | Defines safe access without keys or connection strings | `OLM_STAGING_RBAC_OR_AUTH_MODE` |
| Approved identity/session type | Identifies the principal/session class, not credential values | `OLM_STAGING_IDENTITY_OR_SESSION_TYPE` |
| Approved scoped readback method | Verifies written records by tenant/site/entity/ID | `OLM_STAGING_READBACK_METHOD` |
| Approved scoped rollback method | Reverts only the approved batch if needed | `OLM_STAGING_ROLLBACK_METHOD` |

## Later Staging-Hardening Resources

| Later item | Reason it is not required for first write |
| --- | --- |
| Monitoring dashboards | Useful after a first write path exists |
| Alerting rules | Useful after provider and readback methods are proven |
| Long-term audit export | Useful after staged audit shape is finalized |
| Staging custom domains or UI publishing surfaces | Not needed for OLM data-plane proof |
| Production runtime profile | Explicitly out of scope |

## Proposal Constraints

- Do not use a production provider as the active first-write target.
- Do not use `staging-simulated` for actual write execution.
- Do not use `production-runtime`.
- Do not use keys/listKeys, connection strings, SAS, protected config, or secret export.
- Do not assume an Azure account structure. Operator review must provide non-secret identifiers.

