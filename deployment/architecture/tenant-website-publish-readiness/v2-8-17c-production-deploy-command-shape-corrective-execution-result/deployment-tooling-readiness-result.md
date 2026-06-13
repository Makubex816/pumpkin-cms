# Deployment Tooling Readiness Result

Status: passed before deployment attempt.

| Check | Result |
| --- | --- |
| SWA CLI invocation | `npx --yes @azure/static-web-apps-cli@2.0.9` |
| SWA CLI version | `2.0.9` |
| Command used | `deploy . --app-name "swa-ice-static-staging" --resource-group "rg-ice-static-staging" --env production --no-use-keychain --verbose=silly` |
| `--dry-run` used | no |
| `--no-use-keychain` used | yes |
| Deployment token passed on command line | no |
| Deployment token sourced from process environment | yes |

The deployment client later failed with command-shape error; see `corrected-production-deployment-result.md`.

