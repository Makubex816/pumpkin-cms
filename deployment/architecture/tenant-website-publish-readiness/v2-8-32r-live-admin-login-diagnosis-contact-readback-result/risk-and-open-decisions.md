# Risk And Open Decisions

Open blocker:

- `provider_store_access_failed`: live login cannot read the Admin user because the configured data-store connection string is malformed or missing `AccountEndpoint`.

Risks:

- Health endpoints can return 200 while provider-backed paths fail. The health body currently reports `providerConfigured:false`, so future gates should check this signal before login/readback.
- The contact Admin persistence gate remains open until authenticated Admin readback can prove the saved entry exists.
- Provider repair must be handled in a separately approved phase because it requires production database/provider secret handling.

Open decisions:

- Approve a provider-store binding/repair phase that can set or repair the production database provider settings without appsettings list/show.
- Decide whether the provider repair phase should also run a provider-specific health/readiness check before retrying Admin login.
- Keep the one production contact POST gate closed until authenticated Admin FormEntry readback preflight returns 2xx.

