# IaC Build Validation

Bicep build validation passed before deployment.

Command shape:

```text
az bicep build --file deployment/architecture/azure-staging-foundation/iac/main.bicep --outfile %TEMP%\pumpkincms-v2-3-3-main.json
```

Result:

| Check | Result |
| --- | --- |
| Bicep file present | pass |
| Final parameters generated outside repo | pass |
| Bicep build to temp output | pass |
| Generated build output retained in repo | no |

