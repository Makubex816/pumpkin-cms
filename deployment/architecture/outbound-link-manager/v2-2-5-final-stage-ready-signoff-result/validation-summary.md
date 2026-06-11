# Validation Summary

Passed in V2.2.5:

- Manifest JSON parse for V2.2.2, V2.2.3, V2.2.4, and V2.3.4 evidence packages.
- `node src\outbound-link-cli.mjs validate-staging-execution-package --package .tmp/phase-2h22-staging-execution-package`
- `node src\outbound-link-cli.mjs validate-staging-env-contract --package .tmp/phase-2h22-staging-execution-package`
- `node src\outbound-link-cli.mjs azure-cosmos-staging-readback-hardening --package .tmp/phase-2h22-staging-execution-package --profile fixtures/provider-profile-olm-staging-cosmos-nosql.fixture.json --out .tmp/v2-2-5-final-signoff-readback-sanity --overwrite`
- `npm run test:v2-2-4 --prefix apps\admin`
- `npm run test:phase-2h21 --prefix apps\admin`
- `npm run type-check --prefix apps\admin`
- `dotnet run --project apps\pumpkin-api.Tests\pumpkin-api.Tests.csproj -- --phase-2h9`
- `dotnet run --no-build --project apps\pumpkin-api.Tests\pumpkin-api.Tests.csproj -- --phase-2h14`
- `npm test` in `deployment/architecture/outbound-link-manager/local-scanner-registry-implementation` passed 132 tests.
- Read-only Backup Center staging blob prefix list returned the four expected proof/checksum blobs.

Notes:

- The first Phase 2H-14 API run hit a local compiler file lock. The same test passed with `--no-build`.
- The Admin V2.2.4 marker check initially found a case-sensitive copy mismatch. A one-line copy-only Admin marker normalization was applied and the check passed.
- Generated runtime/readback evidence remains under ignored `.tmp` output.

