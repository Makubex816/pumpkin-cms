# PumpkinCMS Azure Staging Foundation IaC

This is a no-deploy Bicep package for the proposed PumpkinCMS staging foundation.

V2.3.1 creates the template and output contract only. Do not deploy this package without a later explicit approval.

The template is resource-group scoped. A future approved phase must create or select the staging resource group before deploying this template to that scope.

## Files

- `main.bicep`: draft staging foundation template.
- `parameters.example.json`: secret-free example parameters.
- `outputs-contract.md`: non-secret output contract for provider/profile mapping.

## Safety Rules

- Do not run deployment commands during documentation-only phases.
- Do not output keys, connection strings, SAS, tokens, passwords, or secret values.
- Do not point parameters at production resources.
- Do not add RBAC assignments until a separate RBAC approval phase.
- Do not use protected config files to fill parameters.

## Intended Future Validation

Future approved phases may run local Bicep build validation or Azure `what-if` if Azure CLI is already logged in and no secrets or mutations are required.
