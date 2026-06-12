# Deployment Auth Contract Result

Canonical deployment auth contract:

```text
SWA_CLI_DEPLOYMENT_TOKEN
```

The future deployment command must rely on the process environment variable above and must not pass the token value as a command-line argument.

Presence-only checks in the current terminal session:

| Environment variable | Present |
| --- | --- |
| `SWA_CLI_DEPLOYMENT_TOKEN` | false |
| `AZURE_STATIC_WEB_APPS_API_TOKEN_ICE_ISOLATED_STAGING` | false |
| `AZURE_STATIC_WEB_APPS_API_TOKEN_ICE_STAGING` | false |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | false |
| `ICE_STAGING_SWA_DEPLOYMENT_TOKEN` | false |
| `AZURE_STATIC_WEB_APPS_API_TOKEN_ICE` | false |

No token value was read, printed, exported, listed, or written.

Operator action required:

- Place the isolated staging Static Web Apps deployment token into `SWA_CLI_DEPLOYMENT_TOKEN` in the same terminal session before requesting the next deployment execution phase.

