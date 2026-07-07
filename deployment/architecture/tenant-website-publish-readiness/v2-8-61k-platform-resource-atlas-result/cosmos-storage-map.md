# Cosmos And Storage Map

Cosmos accounts:

| account | resourceGroup | region | database | backupPolicy | containerCount | purpose | doNotDeleteStatus |
| --- | --- | --- | --- | --- | ---: | --- | --- |
| cosmos-pumpkin-prod-eastus | rg-ice-production-cosmos | East US | pumpkin-prod-cms | Continuous | 20 | production Pumpkin CMS data | do_not_delete |
| cosmos-pumpkincms-stg-olm01 | rg-pumpkincms-stg-eastus-olm | East US | pumpkincms-olm-staging | Periodic | 10 | older outbound-link-manager staging data | cleanup_candidate_needs_dependency_proof |

Production `pumpkin-prod-cms` containers:

| container | partitionKey | dataHeld |
| --- | --- | --- |
| Page | /tenantId | current page records |
| User | /tenantId | current user records |
| FormEntry | /tenantId | current form submissions |
| forms | /tenantKey | compatibility form records |
| importRuns | /tenantKey | compatibility import run records |
| Tenant | /tenantId | current tenant records |
| routes | /tenantKey | compatibility route records |
| DomainBinding | /tenantId | current custom-domain binding records |
| ImportRun | /tenantId | current import run records |
| mediaAssets | /tenantKey | compatibility media asset records |
| PublishRun | /tenantId | current publish run records |
| Theme | /tenantId | current theme records |
| users | /tenantKey | compatibility user records |
| themes | /tenantKey | compatibility theme records |
| pages | /tenantKey | compatibility page records |
| sites | /tenantKey | compatibility site records |
| tenants | /tenantKey | compatibility tenant records |
| FormDefinition | /tenantId | current form definitions |
| publishRuns | /tenantKey | compatibility publish run records |
| MediaAsset | /tenantId | current media asset records |

Storage accounts:

| account | resourceGroup | region | blobEndpoint | containers | purpose | protections | doNotDeleteStatus |
| --- | --- | --- | --- | --- | --- | --- | --- |
| iceskatingmedia | rg-ice-production-media | eastus | https://iceskatingmedia.blob.core.windows.net/ | ice-rink-rentals-media; airstrip-club-las-vegas-media | production tenant media | soft delete, container soft delete, versioning, change feed enabled | do_not_delete |
| iceforms20260605 | rg-ice-static-form-endpoint | eastus | https://iceforms20260605.blob.core.windows.net/ | azure-webjobs-hosts; azure-webjobs-secrets; function-releases; scm-releases | legacy static contact function support | no current hardening evidence | do_not_delete_until_dependency_proof |
| pumpkincmsstgolm01 | rg-pumpkincms-stg-eastus-olm | eastus | https://pumpkincmsstgolm01.blob.core.windows.net/ | backup-center-staging; resource-registry-staging; runtime-qa-staging | older staging support | no current hardening evidence | cleanup_candidate_needs_dependency_proof |

No storage key/listKeys/SAS command was run.
