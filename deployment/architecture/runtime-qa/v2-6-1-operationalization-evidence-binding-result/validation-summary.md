# Validation Summary

Passed:

- `npm run check` in `deployment/architecture/runtime-qa/platform-runtime-qa-harness`
- `npm run run:v2-6-1` in `deployment/architecture/runtime-qa/platform-runtime-qa-harness`
- `npm run validate:v2-6-1` in `deployment/architecture/runtime-qa/platform-runtime-qa-harness`
- `npm run inspect:v2-6-1` in `deployment/architecture/runtime-qa/platform-runtime-qa-harness`
- Resource Registry operational binding validator
- OLM provider profile check
- OLM staging execution package validator
- OLM_STAGING env contract validator
- `npm run test:phase-2h21 --prefix apps\admin`
- `npm run test:v2-2-4 --prefix apps\admin`
- `npm run type-check --prefix apps\admin`
- `dotnet run --project apps\pumpkin-api.Tests\pumpkin-api.Tests.csproj -- --phase-2h9`
- `dotnet run --project apps\pumpkin-api.Tests\pumpkin-api.Tests.csproj -- --phase-2h14`
- `az storage container show` for `runtime-qa-staging` using `--auth-mode login`

Blocked:

- `az storage blob list` for `runtime-qa-staging` using `--auth-mode login`, due to missing Storage data-plane RBAC.
- Runtime QA evidence upload, because blob data-plane RBAC was not available.

No prohibited action was performed.
