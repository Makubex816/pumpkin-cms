# Azure Resource State

SOT-01 did not create Azure resources, mutate Azure resources, assign RBAC, run live Azure reads, request keys, generate connection strings, or generate SAS.

Canonical resource state is indexed from safe committed reports only.

Current relevant references:

- Resource Registry redacted inventory: Phase 2F-12N.
- Backup Center live-readonly proof chain: Phase 2F-14 and preceding 2F-12R/2F-12S packages.
- Static/Azure staging history: Phase 6U and Ice Azure result reports.

For OLM, Azure/provider foundation is proposal pending.

Future work must decide how to safely supply:

- `OLM_STAGING_RESOURCE_SCOPE`
- `OLM_STAGING_PROVIDER_TYPE`
- `OLM_STAGING_ACCOUNT_OR_HOST`
- `OLM_STAGING_DATABASE_OR_NAMESPACE`
- `OLM_STAGING_RBAC_OR_AUTH_MODE`
- `OLM_STAGING_IDENTITY_OR_SESSION_TYPE`
- `OLM_STAGING_READBACK_METHOD`
- `OLM_STAGING_ROLLBACK_METHOD`

