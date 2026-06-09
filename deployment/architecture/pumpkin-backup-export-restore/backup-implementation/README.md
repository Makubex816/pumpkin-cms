# Pumpkin Backup Center Local Prototype

Phase 2F-12D adds a local-only provider source resolver foundation on top of the standard backup exporter, hardened validator, restore validation dry-run, fake encrypted escrow prototype, and fake Cosmos/media connector foundation.

It creates and validates folder-based standard backup bundles from fake fixtures only, can resolve non-secret provider source fixture metadata, can generate fake Cosmos portable JSON export artifacts, can copy fake media text fixtures, can generate a tenant website bundle index, can generate a restore plan without restoring into any real system, and can generate fake encrypted escrow output under ignored `.tmp`. It does not create production backup zips, export or import a real database, call CMS/API endpoints, export real secrets, create production escrow payloads, download real blobs, restore data, deploy, or touch external systems.

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
- Fake provider source resolver.
- Fake Cosmos/provider portable JSON export connector.
- Fake Cosmos platform backup evidence writer.
- Fake Azure Blob media copy connector using text fixtures only.
- Tenant website bundle index writer.
- Production-restore-proof validator mode for fake complete bundles.
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
npm run create:ice-fake-complete
npm run validate:ice-fake-complete
npm run restore:ice-fake-complete
npm run escrow:create
npm run escrow:validate
npm run escrow:inspect
node src/backup-cli.mjs resolve-provider --fixture fixtures/provider-source.ice.missing.json
npm run create:platform
npm run validate:platform
npm run restore:platform
```

Generated bundles are written only under `.tmp/`, which is ignored by this package.

## Key Docs

- `USAGE.md`
- `STANDARD_BACKUP_FORMAT.md`
- `COSMOS_CONNECTOR_FAKE_MODE.md`
- `MEDIA_CONNECTOR_FAKE_MODE.md`
- `PROVIDER_RESOLVER.md`
- `NON_SECRET_PROVIDER_METADATA.md`
- `PROVIDER_RESOLVER_FIXTURES.md`
- `BACKUP_CENTER_RESOLVER_INTEGRATION.md`
- `TENANT_WEBSITE_BUNDLE_INTEGRATION.md`
- `VALIDATOR.md`
- `RESTORE_VALIDATION.md`
- `ESCROW_FAKE_PROTOTYPE.md`
- `ENCRYPTED_ESCROW_FORMAT.md`
- `ESCROW_POLICY.md`
- `ESCROW_VALIDATOR.md`
- `FIXTURES.md`
- `SECURITY_BOUNDARIES.md`
- `KNOWN_LIMITATIONS.md`
- `NEXT_PHASE_2F12_LIVE_READONLY_CONNECTOR_PREFLIGHT_PROMPT.md`

## Boundary

Local prototype only. Fake adapters only. No real secrets, no protected config, no real Cosmos export/import, no real CMS export/restore, no MediaAsset restore, no real blob download/copy, no static generation/restore, no production escrow payload, no real restore, no external HTTP calls from the fake connector path, and no live-page publication.
