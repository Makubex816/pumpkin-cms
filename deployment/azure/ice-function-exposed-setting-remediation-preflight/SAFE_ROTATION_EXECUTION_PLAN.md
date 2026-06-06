# Safe Rotation Execution Plan

Generated: 2026-06-06

Do not execute this plan without explicit approval.

## Preconditions

- maintenance window approved
- Azure CLI logged in to tenant `38b16667-a82c-4ff8-98d8-aeebbec4536a`
- target Function App confirmed as `func-ice-static-contact-20260605`
- target storage account confirmed as `iceforms20260605`
- no Graph/email production settings are being changed

## Execution Outline

1. Capture current Function state by name/status only.
2. In memory only, identify which storage account key is currently referenced by the affected settings.
3. Rotate the exposed storage account key.
4. Build replacement connection strings in memory only.
5. Update only these Function app setting names:
   - `AzureWebJobsStorage`
   - `WEBSITE_CONTENTAZUREFILECONNECTIONSTRING`
   - `AzureWebJobsDashboard`
6. Restart the Function App only if required.
7. Validate Function host and `/api/static-contact` in dry-run/no-email mode.
8. Document name/status-only results.

## Future Command Pattern

The future execution script must keep key and connection-string material in variables only and use `--output none` for write operations. Do not echo variables.

Illustrative pattern only:

```powershell
# APPROVAL REQUIRED BEFORE RUNNING
# Do not print storage keys or connection strings.

$resourceGroup = "rg-ice-static-form-endpoint"
$functionApp = "func-ice-static-contact-20260605"
$storageAccount = "iceforms20260605"
$affectedSettings = @(
  "AzureWebJobsStorage",
  "WEBSITE_CONTENTAZUREFILECONNECTIONSTRING",
  "AzureWebJobsDashboard"
)

# Read keys into memory only; do not print.
# Rotate the exposed key, then build the replacement connection string in memory.
# Update only the affected settings with --output none.
# Restart only if required, then verify by name/status and dry-run endpoint behavior.
```

The exact key-selection logic should stop if it cannot determine the exposed key without printing secret material.

