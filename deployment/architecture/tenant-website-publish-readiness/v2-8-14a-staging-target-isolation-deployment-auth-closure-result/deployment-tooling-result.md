# Deployment Tooling Result

Global `swa` CLI was not found on `PATH`.

Repo-supported tooling path:

```powershell
npx --yes @azure/static-web-apps-cli@2.0.9 --version
```

Result:

```text
2.0.9
```

Added readiness wrapper:

```text
deployment/static-azure/scripts/ice-isolated-swa-deploy-readiness.mjs
```

The wrapper checks the approved target, artifact root, and `SWA_CLI_DEPLOYMENT_TOKEN` presence without printing token values. It refuses secret-bearing flags such as `--deployment-token`, `--print-token`, and `--client-secret`.

Current wrapper result: `blocked_auth_missing`.

No deployment command was run.

