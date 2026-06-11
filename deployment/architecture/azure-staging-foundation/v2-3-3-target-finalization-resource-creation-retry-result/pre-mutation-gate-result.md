# Pre-Mutation Gate Result

Overall result: passed for resource creation, RBAC skipped.

| Gate | Result |
| --- | --- |
| V2.3.1 result package exists and validates | pass |
| V2.3.2 result package exists and records blocked-before-mutation state | pass |
| Azure CLI installed | pass |
| Azure CLI already logged in | pass |
| Active subscription display name is `Azure subscription 1` | pass |
| Target environment is staging only | pass |
| Target region is `eastus` | pass |
| Target resource group is `rg-pumpkincms-stg-eastus-olm` | pass |
| All resource names explicit and staging-scoped | pass |
| Tags explicit and placeholder-free | pass |
| No production resource names or scopes | pass |
| IaC outputs non-secret identifiers only | pass |
| Parameters contain no secrets | pass |
| Bicep build succeeds | pass |
| What-if shows only staging creates | pass |
| Protected config not required | pass |
| Keys/listKeys, connection strings, SAS, tokens, cookies, and secret values not required | pass |
| RBAC principal, role, and scope explicit | fail for RBAC only |

RBAC assignment was skipped and did not block resource creation.

