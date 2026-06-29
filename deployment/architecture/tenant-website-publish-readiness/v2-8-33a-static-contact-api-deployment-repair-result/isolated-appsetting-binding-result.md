# Isolated Appsetting Binding Result

Target:

- Static Web App: `swa-ice-static-isolated-staging`.
- Resource group: `rg-ice-static-staging`.

Mutation:

- `az staticwebapp appsettings set` was run once for the approved isolated target.
- Setting count: 7.
- Output mode: `-o none`.
- Azure CLI emitted only a redaction warning and no values.

Result: succeeded.

Secret handling:

- Values came from the approved secure file.
- Values were not printed.
- No appsettings list/show command was run.
