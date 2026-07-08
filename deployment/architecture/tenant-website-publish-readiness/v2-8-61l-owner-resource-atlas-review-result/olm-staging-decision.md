# Outbound-Link-Manager Staging Decision

Default state: do not delete.

OLM staging resources are in `rg-pumpkincms-stg-eastus-olm`.

Current classification:

- Older staging/outbound-link-manager resources.
- Redundant-looking only.
- Cleanup candidates require dependency proof.

Future phase:

- V2.8.61P OLM staging dependency proof.

Required before any cleanup:

- Source reference check.
- App/config reference check without reading secret values.
- RBAC/dependency inventory.
- Data retention decision.
- Separate deletion approval.

Blocked now:

- Cosmos deletion.
- Storage deletion.
- Key Vault deletion.
- Workspace deletion.
- Managed identity deletion.
- Application Insights/action group deletion.
