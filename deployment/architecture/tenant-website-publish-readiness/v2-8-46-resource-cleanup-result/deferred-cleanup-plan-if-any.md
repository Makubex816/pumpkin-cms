# Deferred Cleanup Plan If Any

Deferred candidate:

- `rg-ice-static-form-endpoint`

Reason:

- The resource group is non-empty.
- It contains a legacy Function App, App Service plan, and storage account.
- Repo/report references identify it as a legacy/static-form endpoint stack.

Next phase must require explicit approval before any deletion:

```text
Approve V2.8.46A Legacy Static Form Endpoint Decommission Dependency Proof only.

Use the completed V2.8.46 result package and current live resource registry. Inventory `rg-ice-static-form-endpoint`, prove whether `func-ice-static-contact-20260605`, `EastUSPlan`, and `iceforms20260605` receive traffic or are referenced by any live Static Web App route, appsetting, source file, DNS/custom domain, report, or external integration. Do not delete anything unless a later separate approval explicitly authorizes deletion after dependency proof. Do not deploy, do not mutate DNS/custom domains, do not mutate appsettings, do not send contact POSTs, do not mutate content, do not read protected config, do not query Key Vault secrets, do not use keys/listKeys/SAS/connection strings, and do not stage `.tmp`.
```
