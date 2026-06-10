# Test Result

Validation completed:

- `npm run check` in `deployment/architecture/outbound-link-manager/local-scanner-registry-implementation`: passed, 87 tests
- local CLI `api-write-preflight` approved review fixture: passed
- local CLI `api-write-preflight` bulk domain disable fixture: passed
- local CLI `api-write-preflight` live-readonly blocked fixture: passed
- local CLI `api-write-preflight` redacted URL fixture: passed
- standalone `validate-api-write-preflight` for all four generated packages: passed
- `dotnet build pumpkin-api.Tests.csproj -p:BaseOutputPath=bin\phase-2h14-build\`: passed, 0 warnings, 0 errors
- `dotnet ... PumpkinApiTestRunner.dll --phase-2h14`: passed
- `dotnet ... PumpkinApiTestRunner.dll --phase-2h9`: passed
- `npm run type-check` in `apps/admin`: passed

Generated CLI evidence is under `deployment/architecture/outbound-link-manager/local-scanner-registry-implementation/.tmp/phase-2h14`, which is ignored by the package `.gitignore`.
