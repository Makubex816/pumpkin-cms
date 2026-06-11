# Resource Registry Binding Candidate

This candidate contains non-secret Azure staging identifiers only.

| Registry field | Value | Status |
| --- | --- | --- |
| Resource group | `rg-pumpkincms-stg-eastus-olm` | created |
| Resource group ID | `/subscriptions/<redacted>/resourceGroups/rg-pumpkincms-stg-eastus-olm` | created, redacted |
| Location | `eastus` | created |
| Cosmos account | `cosmos-pumpkincms-stg-olm01` | created |
| Cosmos endpoint host | `cosmos-pumpkincms-stg-olm01.documents.azure.com` | created |
| Cosmos database | `pumpkincms-olm-staging` | created |
| Cosmos partition key | `/tenantKey` | created |
| Storage account | `pumpkincmsstgolm01` | created |
| Backup evidence container | `backup-center-staging` | created |
| Resource Registry evidence container | `resource-registry-staging` | created |
| Runtime QA evidence container | `runtime-qa-staging` | created |
| Key Vault | `kv-pumpkincms-stg-olm01` | created |
| Managed identity | `id-pumpkincms-olm-stg` | created |
| Managed identity client ID | `c3220beb-79b9-403a-bf09-b6ce006380a1` | created |
| Managed identity principal ID | `f9e8a811-cd4f-4afb-9f39-9f2fece7e5e2` | created |
| Log Analytics workspace | `log-pumpkincms-stg-olm01` | created |
| Application Insights | `appi-pumpkincms-stg-olm01` | created |

Secret policy:

- credential references only
- no keys
- no connection strings
- no SAS
- no token or cookie material
- no Key Vault secret values

