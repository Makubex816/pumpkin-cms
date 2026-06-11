# What-If Preview Result

Azure what-if ran after the staging resource group existed and before the foundation deployment.

Result summary:

| Change type | Count |
| --- | ---: |
| Create | 21 |
| Modify | 0 |
| Delete | 0 |

What-if scope:

```text
/subscriptions/<redacted>/resourceGroups/rg-pumpkincms-stg-eastus-olm
```

Expected creates:

- Cosmos account, SQL database, and ten OLM containers.
- Storage account, blob service, and three evidence containers.
- Key Vault.
- Managed identity.
- Log Analytics workspace.
- Application Insights component.

No production-scoped, destructive, or broad changes were detected.

