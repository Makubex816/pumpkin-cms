# Pumpkin Backup Center Local Prototype

Phase 2F-5 adds a local-only restore validation dry-run on top of the standard backup exporter and hardened validator.

It creates and validates folder-based standard backup bundles from fake fixtures only, then can generate a restore plan without restoring into any real system. It does not create production backup zips, export or import a real database, call CMS/API endpoints, export secrets, create encrypted escrow payloads, restore data, deploy, or touch external systems.

## Implemented

- Node `.mjs` CLI.
- Standard backup folder-bundle writer.
- Hardened manifest and bundle contract checks.
- SHA-256 checksum writer and tamper detection.
- Fake CMS content adapter.
- Fake database export planner.
- Fake media inventory adapter.
- Fake static evidence adapter.
- Fake redacted config inventory adapter.
- `escrow/ESCROW_NOT_INCLUDED.md` standard-mode marker.
- JSON and Markdown validation reports.
- Failure case manifest and generated negative bundle tests.
- Restore validation dry-run command.
- Restore inventory count comparison.
- Restore-plan JSON and Markdown reports.
- Node built-in tests.

## Quick Start

```powershell
npm test
npm run check
npm run create:tenant
npm run validate:tenant
npm run restore:tenant
npm run create:platform
npm run validate:platform
npm run restore:platform
```

Generated bundles are written only under `.tmp/`, which is ignored by this package.

## Key Docs

- `USAGE.md`
- `STANDARD_BACKUP_FORMAT.md`
- `VALIDATOR.md`
- `RESTORE_VALIDATION.md`
- `FIXTURES.md`
- `SECURITY_BOUNDARIES.md`
- `KNOWN_LIMITATIONS.md`
- `NEXT_PHASE_2F6_ENCRYPTED_ESCROW_PROTOTYPE_PROMPT.md`

## Boundary

Local prototype only. Fake adapters only. No secrets, no protected config, no database export/import, no real CMS export/restore, no MediaAsset restore, no blob copy, no static generation/restore, no escrow payload, no real restore, no external HTTP calls, and no live-page publication.
