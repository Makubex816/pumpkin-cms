# IaC Build Validation

Bicep build validation passed.

Command shape:

```text
az bicep build --file deployment/architecture/azure-staging-foundation/iac/main.bicep --outfile %TEMP%\pumpkincms-v2-3-2-main.json
```

Result:

| Check | Result |
| --- | --- |
| Bicep file present | pass |
| Parameter example JSON parse | pass |
| Bicep build to temp output | pass |
| Generated build output retained in repo | no |
| Azure deployment executed | no |

## IaC Boundary

The template is resource-group scoped. It requires an approved existing or newly created staging resource group before a deployment or group-level what-if can be performed.

