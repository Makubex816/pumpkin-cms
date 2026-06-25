# Safe Auth Session Requirements

Future upload/readback execution must use:

```text
AzureIdentityRBAC
Azure CLI signed-in operator with scoped RBAC
--auth-mode login
```

## Allowed Future Auth Actions

- Confirm the signed-in Azure CLI session can access `iceskatingmedia`.
- Use `az storage container show --auth-mode login`.
- Use `az storage blob list --auth-mode login`.
- Use `az storage blob show --auth-mode login`.
- Use approved upload commands only in a future phase where upload execution is explicitly approved.

## Forbidden Auth Actions

- Do not print, reset, or use deployment tokens.
- Do not read `.env.local`.
- Do not read appsettings or local.settings files.
- Do not query Key Vault secrets.
- Do not run `keys/listKeys`.
- Do not generate connection strings.
- Do not generate SAS.
- Do not fall back to key auth if RBAC/login auth fails.
- Do not inspect suspected secret files.

V2.8.19E used only read-only login/RBAC Azure commands.
