
# Source and toolchain inventory

Package manifests:

- `apps/starter-app/package.json`: pumpkin-starter-app 1.0.0; scripts: build, dev, lint, start, type-check; adjacent lockfile: false
- `packages/pumpkin-block-views/package.json`: pumpkin-block-views 1.0.0; scripts: build, clean, dev; adjacent lockfile: false
- `packages/pumpkin-ts-models/package.json`: pumpkin-ts-models 1.0.0; scripts: blocks:check, blocks:generate, blocks:test, build, clean, dev, lint, test; adjacent lockfile: true

.NET projects and solutions:

- `apps/pumpkin-api.Tests/pumpkin-api.Tests.csproj`; target framework(s): net10.0; package refs: BCrypt.Net-Next@4.0.3, Microsoft.Extensions.Configuration@9.0.0, Microsoft.Extensions.Configuration.Json@9.0.0, Microsoft.Extensions.Configuration.EnvironmentVariables@9.0.0
- `apps/pumpkin-api/pumpkin-api.csproj`; target framework(s): net10.0; package refs: Azure.Identity@1.21.0, Azure.Storage.Blobs@12.29.1, Microsoft.AspNetCore.Authentication.JwtBearer@10.0.3, Microsoft.Azure.Cosmos@3.56.0, BCrypt.Net-Next@4.0.3, Newtonsoft.Json@13.0.4, Swashbuckle.AspNetCore@7.2.0, System.IdentityModel.Tokens.Jwt@8.16.0
- `apps/pumpkin-api/pumpkin-api.sln`
- `apps/pumpkin-net-models/pumpkin-net-models.csproj`; target framework(s): net10.0

Lockfiles:

- Node lockfiles: `package-lock.json`, `packages/pumpkin-ts-models/package-lock.json`
- .NET packages.lock.json files: none found
- Upstream workflows: none found

Toolchain result: `global.json` requests .NET SDK `10.0.100`. The host default resolver did not provide that SDK, so the exact SDK was installed locally outside the repository at `program-management/upstream-intake/UP-30-A01/tools/dotnet-sdk-10.0.100/dotnet.exe` and used for the final .NET restore/build/test qualification.
