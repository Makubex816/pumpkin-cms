# Test Result

## Backup Center

- `npm test`: pass, 59/59.
- `npm run check`: pass.
- `node src/backup-cli.mjs resolve-runtime-profile --fixture fixtures/provider-source.ice.future-target-cosmos.json`: pass.

## API

- Isolated `dotnet build`: pass, 0 warnings, 0 errors.

No external calls, protected config reads, Azure mutation, CMS writes, database exports, Cosmos document exports, or deployment actions were used by tests.

