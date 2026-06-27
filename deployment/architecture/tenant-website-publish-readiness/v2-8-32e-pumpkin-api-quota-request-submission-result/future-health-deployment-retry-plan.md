# Future Health Deployment Retry Plan

Date: 2026-06-27

## Prerequisites

Future health deployment retry requires all of the following:

- East US quota approval confirmed.
- Active subscription locked to `ff887def-fd83-4a19-9298-13d4b1687873`.
- Explicit renewed approval for V2.8.32D retry.
- Target resource names unchanged.
- Protected config boundary unchanged.

## Retry Scope

Under renewed approval only, the V2.8.32D retry may:

- Confirm the existing resource group.
- Confirm the Linux `.NET 10` runtime is still available.
- Reverify the Pumpkin API ZIP artifact or rebuild an equivalent ignored artifact with protected config excluded.
- Create or confirm the planned App Service plan.
- Create or confirm the planned Web App.
- Deploy the Pumpkin API ZIP artifact one time.
- Request only the live `/health` and `/api/health` endpoints.
- Record public-safe health response summaries.

## Still Not In Scope

The retry must still not:

- Send contact POSTs.
- Run FormEntry write validation.
- Run Admin readback validation.
- Bind provider secrets.
- Bind static contact secrets.
- Read protected config.
- Query Key Vault secrets.
- Generate connection strings or SAS values.
- Mutate DNS or custom domains.
- Run Search Console or indexing actions.
- Use deployment token reset, list, print, export, or similar actions.

## Result Expected After Retry

If health succeeds, create a later protected provider-binding and FormEntry validation prompt.

If health does not succeed, stop after the single deployment attempt and document the failure.
