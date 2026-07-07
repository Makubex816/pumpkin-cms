# Observability And Monitoring Map

Workspaces:

| name | resourceGroup | region | retentionDays | state | purpose | doNotDeleteStatus |
| --- | --- | --- | ---: | --- | --- | --- |
| law-pumpkin-prod-centralus-001 | rg-pumpkin-observability-prod-centralus | centralus | 30 | Succeeded | production Pumpkin monitoring workspace | do_not_delete |
| log-pumpkincms-stg-olm01 | rg-pumpkincms-stg-eastus-olm | eastus | 30 | Succeeded | older staging/outbound-link-manager workspace | cleanup_candidate_needs_dependency_proof |
| DefaultWorkspace-ff887def-fd83-4a19-9298-13d4b1687873-EUS | DefaultResourceGroup-EUS | eastus | 30 | Succeeded | default workspace outside current Pumpkin live scope | no_pumpkin_action_approved |

Action groups:

| name | resourceGroup | enabled | purpose | doNotDeleteStatus |
| --- | --- | --- | --- | --- |
| ag-pumpkin-prod-ops-email-001 | rg-pumpkin-observability-prod-centralus | true | production ops alerts | do_not_delete |
| Application Insights Smart Detection | rg-pumpkincms-stg-eastus-olm | true | older Application Insights smart detection | cleanup_candidate_needs_dependency_proof |

Metric alerts:

| name | resourceGroup | enabled | scope | doNotDeleteStatus |
| --- | --- | --- | --- | --- |
| alert-pumpkin-api-prod-http5xx-001 | rg-pumpkin-observability-prod-centralus | true | app-pumpkin-api-prod-centralus-001 | do_not_delete |
| alert-pumpkin-admin-prod-http5xx-001 | rg-pumpkin-observability-prod-centralus | true | app-pumpkin-admin-prod-centralus-001 | do_not_delete |
| alert-pumpkin-admin-isolated-http5xx-001 | rg-pumpkin-observability-prod-centralus | true | app-pumpkin-admin-isolated-centralus-001 | do_not_delete |
| alert-pumpkin-cosmos-normalized-ru-high-001 | rg-pumpkin-observability-prod-centralus | true | cosmos-pumpkin-prod-eastus | do_not_delete |
| alert-ice-media-storage-availability-low-001 | rg-pumpkin-observability-prod-centralus | true | iceskatingmedia | do_not_delete |
| alert-ice-swa-prod-function-errors-001 | rg-pumpkin-observability-prod-centralus | true | swa-ice-static-staging | do_not_delete |

Diagnostic setting readback note:

- V2.8.61K sampled diagnostic settings with read-only CLI commands and no setting rows were returned for the sampled resources.
- This does not roll back or change V2.8.45 hardening history; it records only what this read-only query surfaced.
