# Recommended Remediation Path

Generated: 2026-06-06

## Recommendation

Use Option A: rotate the exposed storage account key and update all affected Function storage connection settings in one controlled execution.

## Why

- `AzureWebJobsStorage` is present, so the runtime storage connection was exposed.
- `WEBSITE_CONTENTAZUREFILECONNECTIONSTRING` and `AzureWebJobsDashboard` are also storage connection setting names and should not retain the exposed key.
- The Function App has no Graph delivery settings and remains dry-run/no-email, so storage remediation can stay independent from email production readiness.

## Guardrails

- do not print keys
- do not print connection strings
- do not write values into repo files
- update only the affected storage connection setting names
- do not change Graph delivery settings
- do not send email
- do not deploy endpoint code
- verify the Function endpoint only in dry-run/no-email mode

