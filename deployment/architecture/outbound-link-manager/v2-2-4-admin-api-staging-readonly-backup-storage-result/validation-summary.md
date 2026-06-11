# Validation Summary

Passed:

- `node --check apps\admin\scripts\v2-2-4-staging-readonly-bridge-check.mjs`
- `npm run test:v2-2-4 --prefix apps\admin`
- `npm run test:phase-2h21 --prefix apps\admin`
- `npm run type-check --prefix apps\admin`
- `dotnet run --project apps\pumpkin-api.Tests\pumpkin-api.Tests.csproj -- --phase-2h9`
- `dotnet run --project apps\pumpkin-api.Tests\pumpkin-api.Tests.csproj -- --phase-2h14`
- `dotnet build apps\pumpkin-api.Tests\pumpkin-api.Tests.csproj --no-restore`
- `npm test` in `deployment/architecture/outbound-link-manager/local-scanner-registry-implementation` (`132` tests)
- `validate-staging-env-contract` with approved non-secret values
- `validate-staging-execution-package`
- `azure-cosmos-staging-readback-hardening` readback sanity (`48`, zero writes)
- Backup Center blob prefix list verified four uploaded proof files

Generated `.tmp` evidence remains ignored and unstaged.
