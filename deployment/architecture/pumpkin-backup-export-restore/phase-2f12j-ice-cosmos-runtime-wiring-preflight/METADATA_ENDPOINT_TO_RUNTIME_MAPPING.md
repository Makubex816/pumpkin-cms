# Metadata Endpoint to Runtime Mapping

The non-secret metadata endpoint is a classification input. It is not a write path and is not an approval to switch runtime storage.

## Expected Endpoint Contract

The endpoint should return only non-secret fields:

- Tenant and site identifiers
- Environment
- Provider type
- Provider role
- Provisioning status
- Runtime status
- Resource group name
- Account name
- Database name
- Container names
- Partition key path
- Backup policy mode
- Live export eligibility
- Data seed eligibility
- Runtime switch eligibility
- Redaction status
- Last verified timestamp or evidence reference

## Mapping Table

| Endpoint State | Runtime Meaning | Allowed Next Step |
| --- | --- | --- |
| `providerStatus=missing` | Provider source unresolved | Discovery expansion |
| `providerRole=future-target` and `provisioningStatus=planned` | Cosmos target not ready | Provisioning approval package |
| `providerRole=future-target` and `provisioningStatus=provisioned` and `runtimeStatus=metadata-endpoint-runtime-wiring-required` | Resources exist, runtime is not wired | No-switch runtime profile implementation approval |
| `runtimeStatus=runtime-profile-disabled` | Runtime code can see profile but must not use it | Read-only runtime verification preflight |
| `runtimeStatus=runtime-configured` | Runtime profile may be available but not necessarily live | Seed/migration and backup proof gates |
| `secretMaterialIncluded=true` | Contract violation | Abort |

## Ice Mapping

Ice should map to the no-switch runtime profile implementation approval path. It must not map to production runtime switch or data seed.

