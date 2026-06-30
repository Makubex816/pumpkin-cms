# Pumpkin API Build Deploy Result

Result: pass.

Tests and build:

- `dotnet run --project apps\pumpkin-api.Tests\pumpkin-api.Tests.csproj -- --v2-8-43-importrun`: pass.
- `dotnet run --project apps\pumpkin-api.Tests\pumpkin-api.Tests.csproj -- --v2-8-42-mediaasset`: pass.
- `dotnet build apps\pumpkin-api\pumpkin-api.csproj --no-restore`: pass, 0 warnings, 0 errors.

Publish/package:

- Publish file count: 56.
- `pumpkin-api.dll` present: yes.
- Protected config entries: 0.
- ZIP entries: 56.
- Backslash ZIP entries: 0.
- Nested parent ZIP entries: 0.

Deploy:

- Deploy count: 1.
- Web App: `app-pumpkin-api-prod-centralus-001`.
- Resource group: `rg-pumpkin-api-prod-centralus`.
- Deployment ID: `f333055c-3bb0-4419-8fa9-40fd5a632608`.
- Deployment status: `RuntimeSuccessful`.

Post-deploy:

- `/health`: HTTP 200.
- `/api/health`: HTTP 200.
- `providerConfigured`: false.
- Admin login: HTTP 200.
