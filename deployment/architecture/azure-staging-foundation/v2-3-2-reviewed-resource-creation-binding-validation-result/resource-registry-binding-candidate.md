# Resource Registry Binding Candidate

This is a candidate only. It must not be treated as a live Resource Registry entry until resources exist and readback validates them.

| Registry field | Candidate value | Status |
| --- | --- | --- |
| Resource group | `rg-pumpkincms-stg-eastus-olm` | missing |
| Location | `eastus` | candidate |
| Cosmos account | `cosmos-pumpkincms-stg-olm01` | not created |
| Cosmos database | `pumpkincms-olm-staging` | not created |
| Cosmos partition key | `/tenantKey` | template candidate |
| Storage account | `pumpkincmsstgolm01` | not created |
| Key Vault | `kv-pumpkincms-stg-olm01` | not created |
| Managed identity | `id-pumpkincms-olm-stg` | not created |
| Diagnostics | `log-pumpkincms-stg-olm01`, `appi-pumpkincms-stg-olm01` | not created |
| Credential model | credential references only | candidate |

## Registry Safety

Do not register secrets, keys, connection strings, SAS, tokens, cookies, auth headers, or private keys. Do not mark this candidate as active until a future creation/readback phase confirms the resources.

