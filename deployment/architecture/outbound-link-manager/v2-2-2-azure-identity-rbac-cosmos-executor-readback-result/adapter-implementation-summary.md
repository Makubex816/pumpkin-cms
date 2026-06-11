# Adapter Implementation Summary

Implemented source files:

- `src/staging-execution/azure-cosmos-staging-adapter.mjs`
- CLI wiring in `src/outbound-link-cli.mjs`
- non-secret provider profile fixture `fixtures/provider-profile-olm-staging-cosmos-nosql.fixture.json`
- tests in `test/azure-cosmos-staging-adapter.test.mjs`
- adjusted local simulated source-scan in `test/staging-persistence-integration.test.mjs`

Added package dependencies:

- `@azure/cosmos`
- `@azure/identity`

The adapter uses Azure Identity/RBAC only. It does not use account keys, connection strings, SAS, protected config, or Key Vault secret values.

The CLI command requires:

```text
azure-cosmos-staging-execute --execute-live-write-approved
```

Without the explicit flag, the command blocks before write.
