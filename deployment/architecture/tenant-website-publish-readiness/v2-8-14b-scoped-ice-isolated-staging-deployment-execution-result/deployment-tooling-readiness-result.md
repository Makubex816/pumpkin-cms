# Deployment Tooling Readiness Result

Global `swa` CLI on PATH: not available.

Repo-supported tooling:

```powershell
npx --yes @azure/static-web-apps-cli@2.0.9
```

Version check:

```text
2.0.9
```

Readiness wrapper:

```text
deployment/static-azure/scripts/ice-isolated-swa-deploy-readiness.mjs
```

Wrapper result:

- Target check: passed.
- Artifact check: passed.
- Auth check: blocked, `SWA_CLI_DEPLOYMENT_TOKEN` absent.
- Deployment attempted: false.

