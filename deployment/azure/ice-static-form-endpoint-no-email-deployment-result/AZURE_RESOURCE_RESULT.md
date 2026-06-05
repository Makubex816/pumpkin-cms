# Azure Resource Result

Generated: 2026-06-05

## Final Resources

Resource group:

```text
rg-ice-static-form-endpoint
```

Location:

```text
eastus
```

Final resources in the group:

| Resource | Type | Purpose |
| --- | --- | --- |
| `iceforms20260605` | `Microsoft.Storage/storageAccounts` | Azure Functions runtime storage |
| `func-ice-static-contact-20260605` | `Microsoft.Web/sites` | working Ice static form Function App |
| `EastUSPlan` | `Microsoft.Web/serverFarms` | required Windows Consumption plan for the Function App |

## Provider Registration

`Microsoft.Web` was registered because the subscription was not registered for Function App creation.

Azure CLI automatically registered monitoring providers during the first Function App creation attempt. The auto-created Application Insights component was removed because monitoring resources were not in the approved minimal resource list.

## Linux Consumption Attempt And Cleanup

Initial planned Linux Consumption app:

```text
func-ice-static-form-20260605
```

That app could be created on Node 24, but SCM/Kudu stayed unavailable with HTTP 503 and Azure CLI zip deployment returned Bad Request. A run-from-package fallback was attempted through the Function runtime storage account, but the app continued to return whole-site 503.

Cleanup completed:

- deleted failed Linux Function App `func-ice-static-form-20260605`
- deleted failed Linux plan `EastUSLinuxDynamicPlan`
- deleted unused internal package container `function-packages`
- removed the auto-created Application Insights component

## Runtime Choice

Azure rejected Node 20 because it reached end of life on 2026-04-30. The deployed endpoint uses:

```text
Node 24
Azure Functions v4
Windows Consumption
```

## Secrets

No storage keys, SAS URLs, connection strings, tokens, or publishing credentials are included in this report.
