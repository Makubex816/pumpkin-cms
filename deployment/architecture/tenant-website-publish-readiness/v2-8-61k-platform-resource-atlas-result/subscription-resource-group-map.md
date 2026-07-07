# Subscription And Resource Group Map

Subscription:

| name | id | operator | status |
| --- | --- | --- | --- |
| Azure subscription 1 | ff887def-fd83-4a19-9298-13d4b1687873 | Contact@iceskatingrinkrentals.com | readable |

Resource groups:

| resourceGroup | region | resourceCount | purpose | doNotDeleteStatus |
| --- | --- | ---: | --- | --- |
| rg-pumpkin-api-prod-centralus | centralus | 6 | Pumpkin API, Admin UI, Airstrip App Services, shared App Service plan | do_not_delete |
| rg-ice-static-staging | eastus2 | 2 | Ice production SWA and isolated SWA proof | do_not_delete |
| rg-ice-production-cosmos | eastus | 1 | production Pumpkin Cosmos | do_not_delete |
| rg-ice-production-media | eastus | 1 | production tenant media storage | do_not_delete |
| rg-pumpkin-observability-prod-centralus | centralus | 8 | production monitoring and alerts | do_not_delete |
| rg-ice-static-form-endpoint | eastus | 3 | legacy static contact function resources | do_not_delete_until_dependency_proof |
| rg-pumpkincms-stg-eastus-olm | eastus | 7 | older outbound-link-manager staging resources | cleanup_candidate_needs_dependency_proof |
| DefaultResourceGroup-EUS | eastus | 1 | default workspace outside current Pumpkin live scope | no_pumpkin_action_approved |

Notes:

- Current live metadata places Airstrip App Services in `rg-pumpkin-api-prod-centralus`.
- Older V2.8.61 domain docs mention an Airstrip-specific resource group name in one place; V2.8.61K live read-only metadata did not show that group and did show Airstrip App Services in the shared Pumpkin API group.
