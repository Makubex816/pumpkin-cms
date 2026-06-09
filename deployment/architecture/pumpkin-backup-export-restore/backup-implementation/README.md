# Pumpkin Backup Center Local Prototype

Phase 2F-6 adds a local-only encrypted escrow prototype with fake fixture values on top of the standard backup exporter, hardened validator, and restore validation dry-run.

It creates and validates folder-based standard backup bundles from fake fixtures only, can generate a restore plan without restoring into any real system, and can generate fake encrypted escrow output under ignored `.tmp`. It does not create production backup zips, export or import a real database, call CMS/API endpoints, export real secrets, create production escrow payloads, restore data, deploy, or touch external systems.

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
- Fake encrypted escrow command.
- Fake escrow policy, approval, recipient metadata, manifest, and validator.
- Node built-in tests.

## Quick Start

```powershell
npm test
npm run check
npm run create:tenant
npm run validate:tenant
npm run restore:tenant
npm run escrow:create
npm run escrow:validate
npm run escrow:inspect
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
- `ESCROW_FAKE_PROTOTYPE.md`
- `ENCRYPTED_ESCROW_FORMAT.md`
- `ESCROW_POLICY.md`
- `ESCROW_VALIDATOR.md`
- `FIXTURES.md`
- `SECURITY_BOUNDARIES.md`
- `KNOWN_LIMITATIONS.md`
- `NEXT_PHASE_2F7_ICE_REAL_BACKUP_PREFLIGHT_PROMPT.md`

## Boundary

Local prototype only. Fake adapters only. No real secrets, no protected config, no database export/import, no real CMS export/restore, no MediaAsset restore, no blob copy, no static generation/restore, no production escrow payload, no real restore, no external HTTP calls, and no live-page publication.
