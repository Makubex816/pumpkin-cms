# Backup Center Resolver Integration Result

Backup Center can now convert provider resolver output into the endpoint-safe runtime metadata response shape.

## Export Gate

Live database export remains blocked because Ice is not runtime-configured and tenant data has not been seeded or migrated.

## CLI Check

```powershell
node src/backup-cli.mjs resolve-runtime-profile --fixture fixtures/provider-source.ice.future-target-cosmos.json
```

Expected state:

- `provisioningStatus: provisioned`
- `runtimeStatus: metadata-endpoint-runtime-wiring-required`
- `liveDatabaseExportAllowed: false`

