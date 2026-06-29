# Admin UI Deployment Shape Decision

Decision: App Service fallback.

Why Static Web Apps was not used:

- Direct `swa` CLI deployment tool was not installed.
- The available Azure CLI `az staticwebapp` commands were resource/source-control oriented and did not provide a direct artifact deployment command.
- Next build emitted dynamic server-rendered routes.

Chosen fallback:

- Existing plan: `asp-pumpkin-api-prod-centralus-001`.
- Isolated web app: `app-pumpkin-admin-isolated-centralus-001`.
- Runtime: `NODE|22-lts`.
- Artifact shape: Next standalone output.
- Startup command: `node server.js`.
