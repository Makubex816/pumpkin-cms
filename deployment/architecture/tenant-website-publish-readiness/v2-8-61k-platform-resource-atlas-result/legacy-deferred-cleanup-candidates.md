# Legacy, Deferred, And Cleanup Candidates

Status: candidates only; no deletion approved.

Legacy static contact resources:

| resource | group | type | currentClassification | requiredBeforeCleanup |
| --- | --- | --- | --- | --- |
| func-ice-static-contact-20260605 | rg-ice-static-form-endpoint | Microsoft.Web/sites | legacy_deferred_do_not_delete_yet | dependency proof that no route, DNS, appsetting, storage, or runtime path still depends on it |
| iceforms20260605 | rg-ice-static-form-endpoint | Microsoft.Storage/storageAccounts | legacy_deferred_do_not_delete_yet | dependency proof and backup/rollback plan |
| EastUSPlan | rg-ice-static-form-endpoint | Microsoft.Web/serverFarms | legacy_deferred_do_not_delete_yet | dependency proof tied to Function App decommission |

Older outbound-link-manager staging resources:

| resource | group | type | currentClassification |
| --- | --- | --- | --- |
| log-pumpkincms-stg-olm01 | rg-pumpkincms-stg-eastus-olm | Log Analytics workspace | cleanup_candidate_needs_dependency_proof |
| cosmos-pumpkincms-stg-olm01 | rg-pumpkincms-stg-eastus-olm | Cosmos DB account | cleanup_candidate_needs_dependency_proof |
| pumpkincmsstgolm01 | rg-pumpkincms-stg-eastus-olm | Storage account | cleanup_candidate_needs_dependency_proof |
| id-pumpkincms-olm-stg | rg-pumpkincms-stg-eastus-olm | Managed identity | cleanup_candidate_needs_dependency_proof |
| appi-pumpkincms-stg-olm01 | rg-pumpkincms-stg-eastus-olm | Application Insights | cleanup_candidate_needs_dependency_proof |
| kv-pumpkincms-stg-olm01 | rg-pumpkincms-stg-eastus-olm | Key Vault | cleanup_candidate_needs_dependency_proof |
| Application Insights Smart Detection | rg-pumpkincms-stg-eastus-olm | Action group | cleanup_candidate_needs_dependency_proof |

Future cleanup proof must be a separate approval and must not use `git add -A`, delete resources blindly, read raw secrets, list keys, or generate SAS tokens.
