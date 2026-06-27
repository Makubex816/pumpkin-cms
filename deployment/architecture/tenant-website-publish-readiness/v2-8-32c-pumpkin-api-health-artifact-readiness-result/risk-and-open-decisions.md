# Risk And Open Decisions

## Risks

- Azure App Service runtime support for `.NET 10 / ASP.NET Core` must be verified in V2.8.32D before resource creation or deployment.
- Health now proves process availability only. It intentionally does not prove Cosmos, JWT, Admin auth, CORS, or provider health.
- The publish artifact excludes appsettings files. Future App Service runtime configuration must come from approved app settings or Key Vault references.
- The worktree was busy before V2.8.32C. Some modifications in `apps/pumpkin-api/Program.cs` and `apps/pumpkin-api.Tests/Program.cs` predated this phase and were preserved.
- A running local Debug `pumpkin-api` process locked Debug build output. Release validation passed and no running process was stopped.

## Open Decisions

- Whether V2.8.32D should create and deploy in one approved phase or split creation, protected binding, and deployment.
- Whether to use direct protected App Service settings or Key Vault references for provider/auth values.
- Whether runtime should remain `DOTNETCORE:10.0` if App Service runtime availability differs from local SDK/runtime state.
- Whether provider health should be a separate authenticated endpoint after protected config approval.
