# Deployment Token Lifecycle Result

SWA deployment tokens were consumed only through `SWA_CLI_DEPLOYMENT_TOKEN` environment variables for the approved isolated and production SWA CLI deploy commands.

Results:

| Target | Deployment attempts used | Result | Token handling |
| --- | ---: | --- | --- |
| Isolated SWA | 1 | Success | Environment variable only; cleared after command |
| Production SWA | 1 | Success | Environment variable only; cleared after command |

No deployment token was passed as a command argument. No token value was printed. No `.env` file was created by the deploy package cleanup check.
