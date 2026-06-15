# Production Target Worksheet

Status: incomplete for execution.

| Required field | Current value | Execution readiness |
| --- | --- | --- |
| providerProfileId | missing | required |
| providerType | `cosmos-nosql-candidate` | candidate only; must be approved concrete production type |
| providerMode | `local-to-production-dry-run` | not executable production mode |
| environmentName | `production-candidate` | not confirmed production |
| resourceGroupOrScope | missing | required |
| accountOrHostName | missing; candidate account reference is `resource-registry:cosmos-pumpkin-prod-eastus` | required |
| databaseOrNamespace | `pumpkin-prod-cms` | candidate only; must be approved |
| targetEntityMappings | present for all 10 OLM entities | usable after target approval |
| tenantKey | `fixture-tenant` | must be operator-approved for production |
| siteKey | `fixture-site` | must be operator-approved for production |
| authMode | missing | required |
| identityOrSessionType | missing | required |
| readbackMethod | proposed in this package | must be bound to approved target |
| rollbackMethod | proposed in this package | must be bound to approved target |

No production metadata check was run because the approved production target/session is not available without a future operator-supplied binding.
