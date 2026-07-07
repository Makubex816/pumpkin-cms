# Local Test Build Result

Status: pass with starter build deferred by policy.

Passed:

- `npm run build` in `packages/pumpkin-ts-models`.
- `npm run build` in `packages/pumpkin-block-views`.
- `dotnet build apps/pumpkin-api/pumpkin-api.csproj -c Release`.
- `dotnet run --project apps/pumpkin-api.Tests/pumpkin-api.Tests.csproj -- --v2-8-48-formdefinition`.
- `dotnet run --project apps/pumpkin-api.Tests/pumpkin-api.Tests.csproj -- --v2-8-53s-external-compat`.
- `dotnet run --project apps/pumpkin-api.Tests/pumpkin-api.Tests.csproj -- --v2-8-58c-user-profile`.
- `dotnet run --project apps/pumpkin-api.Tests/pumpkin-api.Tests.csproj -- --v2-8-60t-domainbinding`.
- `node --check` for literal `.js`, `.mjs`, and `.cjs` files in `apps/starter-app`.
- starter JSON parse.

Transient rerun note:

- Initial parallel .NET test runs for FormDefinition and DomainBinding hit a shared `pumpkin-net-models` Debug DLL file lock. The affected tests passed when rerun sequentially.

Deferred:

- `apps/starter-app` full type-check/build. `apps/starter-app/node_modules` is absent and V2.8.61I does not allow arbitrary dependency installation.
