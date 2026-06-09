# Backup Center Resolver Integration

## Implemented Hook

`writeStandardBundle` can consume a provider source fixture through `connectors.providerSourceFixture`. When supplied, the bundle includes:

- `database/provider-source/provider-source.json`
- `database/provider-source/PROVIDER_SOURCE.md`
- `manifest.componentStatus.providerSource`

## CLI Hook

`backup-cli.mjs` includes a local summary command:

```powershell
node src/backup-cli.mjs resolve-provider --fixture fixtures/provider-source.ice.missing.json
```

The command prints only summary fields and never prints secrets or raw fixture JSON.

## Export Blocking

Provider source states map to readiness:

- `missing`: blocked, Cosmos provisioning preflight required.
- `future-target` + planned/unprovisioned source: provisioning required, export blocked.
- `future-target` + `sourceResolutionStatus: provisioned`: metadata endpoint/runtime wiring required, export blocked.
- `configured` + `cosmos`: ready only for later read-only verification or export preflight approval.
- `local-provider`: blocked for production restore proof.

No live export path is implemented.
