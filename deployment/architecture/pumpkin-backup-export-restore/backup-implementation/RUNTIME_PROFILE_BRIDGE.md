# Runtime Profile Bridge

## Purpose

The runtime profile bridge converts provider resolver metadata into the non-secret response shape expected from the CMS/API provider metadata endpoint.

## Implemented Files

- `src/provider/runtime-profile-bridge.mjs`
- `src/backup-cli.mjs`
- `test/provider-resolver.test.mjs`

## CLI

```powershell
node src/backup-cli.mjs resolve-runtime-profile --fixture fixtures/provider-source.ice.future-target-cosmos.json
```

Expected non-secret summary:

```text
providerType: cosmos
providerStatus: future-target
provisioningStatus: provisioned
runtimeStatus: metadata-endpoint-runtime-wiring-required
liveDatabaseExportAllowed: false
nextAction: metadata-endpoint-runtime-wiring-approval-required
```

## Boundary

The bridge is local-only. It reads fixtures, validates allowlisted fields, and blocks live export. It does not call Azure, CMS/API, databases, blobs, or protected config.

