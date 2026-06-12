# Deployment Auth Readiness Result

Required env var:

```text
SWA_CLI_DEPLOYMENT_TOKEN
```

Presence-only result:

| Environment variable | Present |
| --- | --- |
| `SWA_CLI_DEPLOYMENT_TOKEN` | false |

No token value was printed, exported, listed, logged, read from protected config, or committed.

Operator action:

- Set `SWA_CLI_DEPLOYMENT_TOKEN` in the same terminal session before retrying the scoped isolated staging deployment.

