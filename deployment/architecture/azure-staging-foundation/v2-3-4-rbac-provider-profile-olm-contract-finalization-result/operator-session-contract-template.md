# Operator Session Contract Template

This template documents the non-secret operator/session values required for the future first scoped OLM staging write.

It is a presence contract only. Do not commit tokens, cookies, auth headers, credential cache content, connection strings, account keys, SAS, or Key Vault secret values.

| Field | Required value |
| --- | --- |
| `OLM_STAGING_PROVIDER_PROFILE_ID` | `olm-staging-cosmos-nosql-v1` |
| `OLM_STAGING_PROVIDER_TYPE` | `azure-cosmos-nosql` |
| `OLM_STAGING_PROVIDER_MODE` | `live-write-approved` |
| `OLM_STAGING_RESOURCE_SCOPE` | `resourceGroup:rg-pumpkincms-stg-eastus-olm` |
| `OLM_STAGING_ACCOUNT_OR_HOST` | `cosmos-pumpkincms-stg-olm01.documents.azure.com` |
| `OLM_STAGING_DATABASE_OR_NAMESPACE` | `pumpkincms-olm-staging` |
| `OLM_STAGING_RBAC_OR_AUTH_MODE` | `cosmos-nosql-data-plane-rbac` |
| `OLM_STAGING_IDENTITY_OR_SESSION_TYPE` | `operator-azure-cli-session+managed-identity` |
| `OLM_STAGING_READBACK_METHOD` | `cosmos-nosql-tenant-site-batch-id-readback` |
| `OLM_STAGING_ROLLBACK_METHOD` | `cosmos-nosql-first-write-batch-delete-by-batch-id` |

Future execution must still require explicit first-write approval for `olbatch_b08e184fdc6565aa`.

