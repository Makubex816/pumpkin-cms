# OLM_STAGING Values Resolution Result

## Resolved Or Now Supplyable

| Field | Value | Status |
| --- | --- | --- |
| `OLM_STAGING_PROVIDER_TYPE` | `azure-cosmos-nosql` | resolved |
| `OLM_STAGING_RESOURCE_SCOPE` | `resourceGroup:rg-pumpkincms-stg-eastus-olm` or `/subscriptions/<redacted>/resourceGroups/rg-pumpkincms-stg-eastus-olm` | resolved with subscription ID redacted in docs |
| `OLM_STAGING_ACCOUNT_OR_HOST` | `cosmos-pumpkincms-stg-olm01` or `cosmos-pumpkincms-stg-olm01.documents.azure.com` | resolved |
| `OLM_STAGING_DATABASE_OR_NAMESPACE` | `pumpkincms-olm-staging` | resolved |
| `OLM_STAGING_READBACK_METHOD` | `cosmos-nosql-tenant-site-batch-id-readback` | method defined; data-plane validation pending RBAC |
| `OLM_STAGING_ROLLBACK_METHOD` | `cosmos-nosql-first-write-batch-delete-or-restore-plan` tied to `olbatch_b08e184fdc6565aa` | method defined; execution pending RBAC |

## Still Unresolved For Execution

| Field | Reason |
| --- | --- |
| `OLM_STAGING_PROVIDER_PROFILE_ID` | Candidate exists in docs, but no repo-supported active provider profile is registered. |
| `OLM_STAGING_PROVIDER_MODE` | Must remain future-gated until first-write approval. |
| `OLM_STAGING_RBAC_OR_AUTH_MODE` | No RBAC assignment was created. |
| `OLM_STAGING_IDENTITY_OR_SESSION_TYPE` | Managed identity exists, but no role assignment or final execution identity binding exists. |

## Write Status

The first OLM staging write remains unapproved and unexecuted:

- approval manifest: `olapprove_508df3f03faa4f80`
- first-write batch: `olbatch_b08e184fdc6565aa`
- expected records: `48`
- records written: `0`
- readback run: `false`

