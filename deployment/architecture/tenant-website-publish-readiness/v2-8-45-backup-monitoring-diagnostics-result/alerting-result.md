# Alerting Result

Metric names were discovered before alert creation. Created/updated low-noise alerts:

| Alert | Target | Condition | Severity | Status |
| --- | --- | --- | --- | --- |
| alert-pumpkin-api-prod-http5xx-001 | app-pumpkin-api-prod-centralus-001 | total Http5xx > 5 | 2 | enabled |
| alert-pumpkin-admin-prod-http5xx-001 | app-pumpkin-admin-prod-centralus-001 | total Http5xx > 5 | 3 | enabled |
| alert-pumpkin-admin-isolated-http5xx-001 | app-pumpkin-admin-isolated-centralus-001 | total Http5xx > 10 | 4 | enabled |
| alert-pumpkin-cosmos-normalized-ru-high-001 | cosmos-pumpkin-prod-eastus | max NormalizedRUConsumption > 90 | 3 | enabled |
| alert-ice-media-storage-availability-low-001 | iceskatingmedia | avg Availability < 99 | 3 | enabled |
| alert-ice-swa-prod-function-errors-001 | swa-ice-static-staging | total FunctionErrors > 5 | 3 | enabled |

No SMS, voice, or webhook receivers were created. Alerts route to `ag-pumpkin-prod-ops-email-001`.
