# Live API Readiness Summary

The live Pumpkin API is not ready for protected provider binding.

## Ready

- V2.8.32C health/artifact readiness carried forward.
- Linux `.NET 10` runtime is available as `DOTNETCORE|10.0`.
- The deployment artifact exists and matches the expected SHA-256.
- The planned resource group exists.

## Not Ready

- The Linux App Service plan does not exist.
- The Web App does not exist.
- The Pumpkin API ZIP has not been deployed.
- The live `/health` and `/api/health` endpoints have not been verified.
- Provider/contact app settings remain intentionally unbound.

## Required Before Provider Binding

1. Resolve East US Total VMs quota for the planned Linux App Service plan.
2. Create or confirm `asp-pumpkin-api-prod-eastus-001`.
3. Create or confirm `app-pumpkin-api-prod-eastus-001` with `DOTNETCORE|10.0`.
4. Deploy `.tmp/v2-8-32c/pumpkin-api.zip` exactly once under a renewed approval.
5. Run only the approved `/health` and `/api/health` GET checks.

