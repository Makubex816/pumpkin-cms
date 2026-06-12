# Validation Summary

Passed validations:

- `npm run check` in `deployment/architecture/runtime-qa/platform-runtime-qa-harness`
- `npm run run:v2-7-1` in `deployment/architecture/runtime-qa/platform-runtime-qa-harness`
- `npm run validate:v2-7-1` in `deployment/architecture/runtime-qa/platform-runtime-qa-harness`
- `npm run inspect:v2-7-1` in `deployment/architecture/runtime-qa/platform-runtime-qa-harness`
- `npm run type-check` in `apps/admin`
- `npm run test:phase-2h21` in `apps/admin`
- `npm run test:v2-2-4` in `apps/admin`
- `dotnet run --project apps/pumpkin-api.Tests/pumpkin-api.Tests.csproj -- --phase-2h9`
- `dotnet run --project apps/pumpkin-api.Tests/pumpkin-api.Tests.csproj -- --phase-2h14`
- `node src/resource-registry-cli.mjs validate-operational-bindings --fixture fixtures/operational-bindings.v2-5-1.fixture.json --out .tmp/v2-7-1-operational-bindings --overwrite`
- `node src/outbound-link-cli.mjs provider-check --profile fixtures/provider-profile-olm-staging-cosmos-nosql.fixture.json --out .tmp/v2-7-1-provider-profile-check`
- `node src/outbound-link-cli.mjs validate-staging-env-contract --package .tmp/phase-2h22-staging-execution-package`

Runtime QA evidence:

- Run ID: `runtimeqa_e25ad7f3a49faaa5`
- Status: `passed`
- Validation: `passed`
- Checks: `15`
- Blocked checks: `0`
- Warnings: `1`
