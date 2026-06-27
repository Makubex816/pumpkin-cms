# Rollback Plan

Date: 2026-06-27

## Created In This Phase

- `rg-pumpkin-api-prod-eastus2`
- `rg-pumpkin-api-prod-centralus`
- `asp-pumpkin-api-prod-centralus-001`
- `app-pumpkin-api-prod-centralus-001`

## Guidance

No rollback was performed.

If Central US remains the selected target, keep the Central US resource group, plan, and Web App for deployment diagnostics.

If East US 2 fallback is abandoned, cleanup of `rg-pumpkin-api-prod-eastus2` requires separate approval.

Any Azure deletion requires separate explicit rollback approval.
