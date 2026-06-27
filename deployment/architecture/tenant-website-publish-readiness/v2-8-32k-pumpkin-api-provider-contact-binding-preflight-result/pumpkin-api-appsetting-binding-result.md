# Pumpkin API Appsetting Binding Result

Result: not run.

No Pumpkin API Web App app settings were mutated in V2.8.32K.

Reason:

- Source does not use `PUMPKIN_API_FORMENTRY_PROVIDER_BINDING_SECRET` as an app setting.
- Source validates FormEntry write Bearer keys against the tenant record in the configured database.
- Source-required API provider/auth settings include `Database__Provider`, `Database__CosmosDb__ConnectionString`, `Database__CosmosDb__DatabaseName`, `Jwt__SecretKey`, `Jwt__Issuer`, `Jwt__Audience`, and `Jwt__ExpirationMinutes`.
- Required protected API values were not supplied under approved operator env names for this phase.

No `az webapp config appsettings set`, `az webapp config appsettings list`, or `az webapp config appsettings show` command was run.
