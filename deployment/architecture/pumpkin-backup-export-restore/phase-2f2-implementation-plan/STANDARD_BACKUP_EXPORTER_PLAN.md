# Standard Backup Exporter Plan

## Phase 2F-3 First Target

Build a local-only standard backup exporter prototype.

Recommended package path:

`deployment/architecture/pumpkin-backup-export-restore/backup-implementation/`

## First Prototype Behavior

- Accept tenant or platform scope from CLI flags.
- Produce a folder-based bundle under ignored `.tmp/`.
- Write `manifest.json`.
- Write `checksums.sha256`.
- Write `BACKUP_SUMMARY.md`.
- Write `RESTORE_INSTRUCTIONS.md`.
- Write `database/DATABASE_EXPORT_NOT_INCLUDED.md`.
- Write `cms-content/` from safe local docs/evidence adapters first.
- Write `media/MEDIA_EXPORT_NOT_INCLUDED.md` or safe inventory placeholder.
- Write `static/STATIC_OUTPUT_NOT_INCLUDED.md` or safe evidence placeholder.
- Write `config-inventory/env-inventory.redacted.json` with names/status placeholders only.
- Write `escrow/ESCROW_NOT_INCLUDED.md`.
- Run backup validator before reporting success.

## Exclusions

Phase 2F-3 must not:

- export a real database;
- call CMS/API;
- copy media blobs;
- run static generation;
- read protected config;
- export secrets;
- create a zip;
- create escrow payloads.

## Adapter Staging

Initial adapters should be local placeholder adapters with strict interfaces:

- `CmsContentExporter.export(scope, outDir)`
- `DatabaseExportPlanner.plan(scope, outDir)`
- `MediaInventoryExporter.export(scope, outDir)`
- `StaticEvidenceExporter.export(scope, outDir)`
- `ConfigInventoryRedactor.export(scope, outDir)`

Real adapters require later approvals.
