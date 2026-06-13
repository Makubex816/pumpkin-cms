# Deployment Tooling Readiness Result

Status: passed.

Pinned tooling:

```text
npx --yes @azure/static-web-apps-cli@2.0.9
```

Version check:

```text
2.0.9
```

The deploy help confirmed env-var token support and showed `--deployment-token` and `--print-token` as available options. Those options were not used.

The deployed command shape was:

```text
npx --yes @azure/static-web-apps-cli@2.0.9 deploy "<validated-artifact-root>" --env production
```

The token source was only `SWA_CLI_DEPLOYMENT_TOKEN` in the current process environment.
