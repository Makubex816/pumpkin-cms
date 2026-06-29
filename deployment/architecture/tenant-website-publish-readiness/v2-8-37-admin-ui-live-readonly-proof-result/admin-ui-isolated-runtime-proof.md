# Admin UI Isolated Runtime Proof

Isolated default host:

`https://app-pumpkin-admin-isolated-centralus-001.azurewebsites.net`

GET proof after failed deployment:

- `/`: 503.
- `/login`: 503.

Classification:

`isolated_runtime_not_serving_after_failed_deployment`.

Local artifact proof:

- Standalone artifact `/`: 200.
- Standalone artifact `/login`: 200.

This separates artifact viability from Azure OneDeploy failure.
