# Pumpkin API Build And Deploy Result

Result: pass.

Build and tests:

- `dotnet run --project apps/pumpkin-api.Tests/pumpkin-api.Tests.csproj -- --v2-8-58c-user-profile`: passed.
- `dotnet run --project apps/pumpkin-api.Tests/pumpkin-api.Tests.csproj -- --v2-8-58a-tenantadmin`: passed.
- `dotnet build apps/pumpkin-api/pumpkin-api.csproj`: passed.
- `dotnet publish apps/pumpkin-api/pumpkin-api.csproj -c Release --no-restore -o .tmp/v2-8-58c/artifacts/pumpkin-api-publish /p:ExcludeAppSettingsFromPublish=true`: passed.

Artifact:

- `.tmp/v2-8-58c/artifacts/pumpkin-api-v2-8-58c.zip`
- Entries: 56.
- POSIX entry check: pass.
- Protected config entries: 0.

Deployment:

- Web App: `app-pumpkin-api-prod-centralus-001`
- Resource group: `rg-pumpkin-api-prod-centralus`
- Attempts: 1.
- Deployment ID: `019083f5-df57-45a1-9f06-86e8efb14bae`
- Status: `RuntimeSuccessful`
- Successful instances: 1.
- Failed instances: 0.

Post-deploy health:

- `/health`: HTTP 200.
- `/api/health`: HTTP 200.
- Health body still reported `providerConfigured:false`; authenticated login and user-management read/update proof passed after deploy.

