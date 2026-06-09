# Backup Center Integration Result

## Implemented

`writeStandardBundle` now accepts `connectors.providerSourceFixture`.

When provided, Backup Center writes:

- `database/provider-source/provider-source.json`;
- `database/provider-source/PROVIDER_SOURCE.md`;
- `manifest.componentStatus.providerSource`;
- tenant website bundle `providerSource` metadata when the tenant website bundle index is enabled.

## CLI

Added:

```powershell
node src/backup-cli.mjs resolve-provider --fixture fixtures/provider-source.ice.missing.json
```

## Export Blocking

The integration hook records readiness but never runs live export. Missing and future-target states keep live connector execution blocked.
