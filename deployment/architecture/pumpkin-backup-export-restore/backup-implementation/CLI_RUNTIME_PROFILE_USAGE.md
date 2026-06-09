# CLI Runtime Profile Usage

The runtime profile CLI commands are fixture-only in Phase 2F-12K.

## List Profiles

```powershell
npm run runtime-profile:list
```

## Inspect Ice Future Cosmos Profile

```powershell
npm run runtime-profile:inspect
```

Equivalent direct command:

```powershell
node src/backup-cli.mjs runtime-profile:inspect --runtime-fixture fixtures/runtime-profile.ice.future-target-cosmos.json
```

## Validate Runtime Profile

```powershell
npm run runtime-profile:validate
```

Expected Ice result:

```text
runtimeProfile: runtime-cosmos-future
liveDatabaseExportAllowed: false
runtimeSwitchAllowed: false
productionWritesAllowed: false
```

## Boundary

The CLI prints status fields only. It does not read protected config, call Azure, call CMS/API, export data, download blobs, or switch runtime storage.

