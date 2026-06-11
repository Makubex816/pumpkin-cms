# IaC Template Summary

## Package

```text
deployment/architecture/azure-staging-foundation/iac/
```

## Format

Bicep was selected because no existing Terraform or Bicep convention was found in the searched deployment/app/package paths, and Bicep is a concise native Azure template format for this no-deploy package.

## Files

| File | Purpose |
| --- | --- |
| `README.md` | No-deploy usage and boundary notes |
| `main.bicep` | Draft staging foundation template |
| `parameters.example.json` | Secret-free example parameters |
| `outputs-contract.md` | Non-secret output contract for provider/profile mapping |

## Template Scope

The Bicep draft is resource-group scoped and describes:

- The approved staging resource group as the deployment scope.
- Cosmos DB for NoSQL account, database, and OLM containers using `/tenantKey`.
- Explicitly named storage account and evidence containers.
- Key Vault with RBAC mode.
- User-assigned managed identity candidate.
- Log Analytics workspace.
- Application Insights component.

The template intentionally does not create the resource group, RBAC role assignments, or secret values in V2.3.1.

## Output Rules

Allowed outputs:

- Resource names.
- Resource group name and ID.
- Cosmos account endpoint hostname.
- Cosmos database name.
- Container names.
- Storage account and container names.
- Key Vault name.
- Managed identity name.
- Diagnostics resource names.

Forbidden outputs:

- Keys.
- `listKeys` results.
- Connection strings.
- SAS.
- Tokens.
- Passwords.
- Secret values.
- Auth headers.

## Execution Status

No deployment or Azure `what-if` was executed in V2.3.1.
