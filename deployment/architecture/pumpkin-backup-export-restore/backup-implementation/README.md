# Pumpkin Backup Center Local Prototype

Phase 2F-4 hardens the local-only standard backup validator and bundle contract that began in Phase 2F-3.

It creates and validates folder-based standard backup bundles from fake fixtures only. It does not create production backup zips, export a real database, call CMS/API endpoints, export secrets, create encrypted escrow payloads, restore data, deploy, or touch external systems.

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
- Node built-in tests.

## Quick Start

```powershell
npm test
npm run check
npm run create:tenant
npm run validate:tenant
npm run create:platform
npm run validate:platform
```

Generated bundles are written only under `.tmp/`, which is ignored by this package.

## Key Docs

- `USAGE.md`
- `STANDARD_BACKUP_FORMAT.md`
- `VALIDATOR.md`
- `FIXTURES.md`
- `SECURITY_BOUNDARIES.md`
- `KNOWN_LIMITATIONS.md`
- `NEXT_PHASE_2F5_RESTORE_VALIDATION_PROMPT.md`

## Boundary

Local prototype only. Fake adapters only. No secrets, no protected config, no database export, no real CMS export, no MediaAsset export, no blob copy, no static generation, no escrow payload, no restore, no external HTTP calls, and no live-page publication.
