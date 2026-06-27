# Future Health Deployment Retry Plan

Date: 2026-06-27

## Status

Future health deployment retry is blocked.

## Required Preconditions

- Quota approval confirmed.
- Subscription locked to `ff887def-fd83-4a19-9298-13d4b1687873`.
- Path A preserved or explicitly replaced by a new approval.
- Explicit approval for health-only deployment retry.
- Target resource names unchanged:
  - `rg-pumpkin-api-prod-eastus`
  - `asp-pumpkin-api-prod-eastus-001`
  - `app-pumpkin-api-prod-eastus-001`

## Future Health-Only Scope

Under later approval only, the retry may:

- Confirm the resource group.
- Confirm Linux `.NET 10` runtime availability.
- Reverify the Pumpkin API ZIP artifact or rebuild an equivalent ignored artifact with protected config excluded.
- Create or confirm the planned App Service plan.
- Create or confirm the planned Web App.
- Deploy the Pumpkin API ZIP artifact one time.
- Request only `/health` and `/api/health`.
- Record public-safe health summaries.

## Excluded From Future Health-Only Retry

- Contact POST.
- FormEntry write validation.
- Admin readback validation.
- Provider secret binding.
- Static contact secret binding.
- Protected config read.
- Key Vault secret query.
- keys/listKeys.
- Connection string or SAS generation.
- DNS/custom-domain mutation.
- Search Console/indexing.
- Deployment token reset/list/print/export/use.
