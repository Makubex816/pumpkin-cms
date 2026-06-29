# Pumpkin API App Service Inventory

- Web App: `app-pumpkin-api-prod-centralus-001`.
- Resource group: `rg-pumpkin-api-prod-centralus`.
- Region: Central US.
- Default hostname: `app-pumpkin-api-prod-centralus-001.azurewebsites.net`.
- State: Running.
- Kind: `app,linux`.
- HTTPS only: false.
- Plan: `asp-pumpkin-api-prod-centralus-001`.
- Plan SKU: Basic B1.
- Runtime metadata: `DOTNETCORE|10.0`.
- Always On: false.
- Minimum TLS: 1.2.
- FTPS state: FtpsOnly.

Health checks:

- `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/health`: HTTP 200.
- `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/health`: HTTP 200.
- `providerConfigured`: false.
- Source finding: `providerConfigured:false` is hardcoded in the dependency-light health response in `apps/pumpkin-api/Program.cs`.

Build checks:

- Initial `dotnet build --no-restore` failed due local process `pumpkin-api (127068)` holding the existing output DLL.
- Isolated output build passed with 0 warnings and 0 errors.
