# Corrective Action Classification

Classification: `blocked_token_target_ambiguous`.

Safe corrective action identified:

```text
npx --yes @azure/static-web-apps-cli@2.0.9 deploy . --env production --swa-config-location .
```

Required execution context:

- working directory must be the validated artifact root;
- target must remain `swa-ice-static-staging` in `rg-ice-static-staging`;
- token source must remain `SWA_CLI_DEPLOYMENT_TOKEN` by environment-variable reference only;
- token value must not be printed, listed, exported, logged, written to docs, or committed;
- DNS, custom domains, indexing, CMS/provider writes, Azure configuration, app settings, RBAC, protected config, keys/listKeys, connection strings, and SAS remain closed.

Why the corrective action was not executed:

- The current token is present by boolean-only checks.
- A non-deploying dry-run rejected the token as invalid.
- Process evidence therefore cannot confirm the token belongs to the approved production target.

No corrective production deployment retry was sent.
