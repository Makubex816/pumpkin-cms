# Usage

Run commands from:

```powershell
deployment/architecture/pumpkin-backup-export-restore/backup-implementation
```

## Help

```powershell
node src/backup-cli.mjs help
node src/backup-cli.mjs version
```

## Create Tenant Standard Backup

```powershell
node src/backup-cli.mjs create-standard --scope tenant --answers fixtures/tenant-standard-backup.answers.json --out .tmp/tenant-standard-backup --overwrite
```

## Create Platform Standard Backup

```powershell
node src/backup-cli.mjs create-standard --scope platform --answers fixtures/platform-standard-backup.answers.json --out .tmp/platform-standard-backup --overwrite
```

## Validate

```powershell
node src/backup-cli.mjs validate --bundle .tmp/tenant-standard-backup
```

`validate` writes `validation-result.json` and `VALIDATION_RESULT.md` by default. It exits with a non-zero status when validation fails.

Proof-mode validation for the fake complete Cosmos/media bundle:

```powershell
node src/backup-cli.mjs validate --bundle .tmp/ice-cosmos-media-fake-complete --mode production-restore-proof
```

## Unified Complete Standard Backup Generator

Local fake complete workflow:

```powershell
node src/backup-cli.mjs create-complete-standard --profile fake-complete --out .tmp/phase-2f13-unified-backup-generator/fake-complete --download --download-out .tmp/phase-2f13-unified-backup-generator/fake-download --overwrite
```

Approved live-readonly Ice workflow:

```powershell
node src/backup-cli.mjs create-ice-complete-standard --profile live-readonly --out .tmp/phase-2f13-unified-backup-generator/ice-complete-standard --download --download-out .tmp/phase-2f13-unified-backup-generator/ice-download --overwrite
```

Package an existing validated standard bundle:

```powershell
node src/backup-cli.mjs package-download --bundle .tmp/phase-2f13-unified-backup-generator/fake-complete --out .tmp/phase-2f13-unified-backup-generator/fake-download --overwrite
```

Equivalent local package scripts:

```powershell
npm run create:complete-standard-fake
npm run create:complete-standard-fake-download
npm run package-download:fake
```

The generator writes a complete folder bundle, redacted Resource Registry reference files, operator summary, retention instructions, validation reports, dry-run restore plan summary, and optional ZIP download package under ignored `.tmp`. The fake profile is offline. The live-readonly profile may use only the approved read-only Cosmos export and media copy paths.

## Restore Validation Dry-Run

```powershell
node src/backup-cli.mjs restore-plan --bundle .tmp/tenant-standard-backup --out .tmp/tenant-restore-plan --overwrite
```

`restore-plan` validates the backup bundle first, compares fake inventory counts, writes restore-plan JSON/Markdown reports, and exits non-zero if validation fails. It does not restore anything.

## Ice Cosmos Seed/Migration Dry-Run

```powershell
node src/backup-cli.mjs cosmos-seed:ice-dry-run --source .tmp/ice-full-standard-backup --out .tmp/phase-2f12o-ice-cosmos-seed-dry-run --overwrite
node src/backup-cli.mjs cosmos-seed:validate --seed .tmp/phase-2f12o-ice-cosmos-seed-dry-run
```

Equivalent package scripts:

```powershell
npm run cosmos-seed:ice-dry-run
npm run cosmos-seed:validate
npm run cosmos-seed:live-execute
```

The dry-run validates the source backup bundle first, maps Ice tenant/site/page/route/form/media/theme metadata into approved Cosmos container JSON arrays, writes `SEED_PLAN.md`, `READBACK_PLAN.md`, `ROLLBACK_PLAN.md`, checksums, and validation reports, and exits non-zero if any container, partition, checksum, path, or secret-scan check fails. It does not write Cosmos, call Azure, call CMS APIs, read protected config, export a database, download media, switch runtime, deploy, or publish live pages.

## Guarded Live Cosmos Seed

```powershell
node src/backup-cli.mjs cosmos-seed:live-execute --seed .tmp/phase-2f12o-ice-cosmos-seed-dry-run --out .tmp/phase-2f12p-live-cosmos-seed --overwrite
```

The guarded command validates the 12O seed package, attempts Azure AD/RBAC data-plane access without printing or persisting tokens, reads existing tenant-scoped state, blocks on conflicts, and creates only missing approved seed documents. It never falls back to keys/listKeys, connection strings, SAS, or protected config. If Cosmos native RBAC is unavailable, it writes a blocked execution manifest with zero writes.

## Fake Ice Cosmos/Media Connector Bundle

```powershell
node src/backup-cli.mjs create-standard --scope tenant --answers fixtures/ice-cosmos-media-standard-backup.answers.json --with-fake-cosmos --with-fake-media-copy --tenant-website-bundle --out .tmp/ice-cosmos-media-fake-complete --overwrite
node src/backup-cli.mjs validate --bundle .tmp/ice-cosmos-media-fake-complete --mode production-restore-proof
node src/backup-cli.mjs restore-plan --bundle .tmp/ice-cosmos-media-fake-complete --out .tmp/ice-cosmos-media-fake-complete-restore-plan --mode production-restore-proof --overwrite
```

Equivalent package scripts:

```powershell
npm run create:ice-fake-complete
npm run validate:ice-fake-complete
npm run restore:ice-fake-complete
```

This mode writes fake Cosmos JSON and fake text blob copy artifacts only. It does not call Cosmos, Azure Blob Storage, CMS APIs, or protected config.

## Fake Encrypted Escrow

```powershell
node src/backup-cli.mjs escrow-create-fake --request fixtures/fake-escrow-request.json --out .tmp/fake-escrow --overwrite
node src/backup-cli.mjs escrow-validate --escrow .tmp/fake-escrow
node src/backup-cli.mjs escrow-inspect --escrow .tmp/fake-escrow
```

`escrow-create-fake` uses fake fixtures only, generates runtime test keys, writes encrypted fake escrow output under `.tmp`, and does not print fake payload values.

## Inspect

```powershell
node src/backup-cli.mjs inspect --bundle .tmp/tenant-standard-backup
```

`inspect` prints only non-secret manifest summary fields.

## Output Rule

The CLI refuses to write generated output outside package `.tmp/`. It writes folder bundles, restore-plan dry-run output, Cosmos seed dry-run/live execution reports, fake connector output, optional generator download ZIPs, and fake encrypted escrow test output only, and blocks archive-style bundle paths such as `.zip`, `.backup`, `.bak`, and `.bacpac`.

## Phase Boundary

This CLI does not read protected config, inspect real secret values, perform Cosmos writes from the generator, mutate storage, call CMS/API endpoints from the fake connector or seed dry-run flow, export/import a real database outside the approved read-only Cosmos proof path, create production escrow payloads, restore data into real systems, deploy, index, or publish live pages.
