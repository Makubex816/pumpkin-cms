# Deployment Tooling Result

Status: passed before deployment attempt.

| Check | Result |
| --- | --- |
| SWA CLI invocation | `npx --yes @azure/static-web-apps-cli@2.0.9` |
| SWA CLI version | `2.0.9` |
| Artifact-root command shape | `npx --yes @azure/static-web-apps-cli@2.0.9 deploy . --env production --swa-config-location .` |
| Deployment token passed on command line | no |
| Deployment token sourced from process environment | yes |

The deployment client later failed with exit code `1`; see `corrective-production-deployment-result.md`.

