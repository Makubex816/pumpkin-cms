# Pumpkin Backup Center Local Prototype

Phase 2F-3 implements the first local-only standard backup exporter prototype.

It creates folder-based standard backup bundles from fake fixtures only. It does not create production backup zips, export a real database, call CMS/API endpoints, export secrets, create encrypted escrow payloads, restore data, or touch external systems.

## Implemented

- Node `.mjs` CLI.
- Standard backup folder-bundle writer.
- Manifest writer.
- SHA-256 checksum writer.
- Fake CMS content adapter.
- Fake database export planner.
- Fake media inventory adapter.
- Fake static evidence adapter.
- Fake redacted config inventory adapter.
- `escrow/ESCROW_NOT_INCLUDED.md` standard-mode marker.
- Backup validator.
- Fake fixtures.
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

## Boundary

Local prototype only. Fake adapters only. No secrets, no protected config, no database export, no real CMS export, no MediaAsset export, no blob copy, no static generation, no escrow payload, no restore, no external HTTP calls, and no live-page publication.
