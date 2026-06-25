# Isolated Staging Deployment Result

Result: success.

Deployment attempts sent:

- 1

Selected artifact:

- `apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260625060958/repo/apps/ice-rink-web/out`

Target:

- App name: `swa-ice-static-isolated-staging`
- Resource group: `rg-ice-static-staging`
- Default host: `kind-island-0a85a740f.7.azurestaticapps.net`

Command shape:

- `npx --yes @azure/static-web-apps-cli@2.0.9 deploy <selected sanitized out> --app-name <isolated app> --resource-group <isolated resource group> --env production`
- The token was supplied through the existing `SWA_CLI_DEPLOYMENT_TOKEN` environment variable.
- The token value was not placed in the command text and was not printed.

Observed CLI result:

- SWA CLI version: `2.0.9`
- Deployed front-end folder: selected sanitized `out`
- Environment: `production` on the isolated staging SWA app only
- Result URL: `https://kind-island-0a85a740f.7.azurestaticapps.net`

CLI warning observed:

- The CLI reported an unrelated legacy `routes.json` under `deployment/architecture/pumpkin-backup-export-restore/backup-implementation/.tmp/...` and said it was ignored.
- No retry was sent.
- No production-bound app was targeted.

Conclusion:

The isolated staging deployment succeeded exactly once.
