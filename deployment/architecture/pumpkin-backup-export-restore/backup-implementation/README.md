# Pumpkin Backup Center Local Prototype

Phase 2F-13 productizes the Backup Center generator into a repeatable local/live-readonly standard backup workflow for Ice on top of the standard backup exporter, hardened validator, restore validation dry-run, fake encrypted escrow prototype, fake Cosmos/media connector foundation, provider source resolver, runtime profile model, Cosmos seed tooling, live-readonly Cosmos export proof, and media full-copy proof.

It creates and validates folder-based standard backup bundles, can resolve non-secret provider source fixture metadata, can generate fake Cosmos portable JSON export artifacts, can map a validated Ice standard backup baseline into Cosmos-ready seed dry-run documents, can copy fake media text fixtures, can use approved live-readonly Cosmos/media proof paths, can include a redacted Resource Registry reference, can write operator summaries and retention guidance, can generate a restore plan without restoring into any real system, can optionally create a downloadable ZIP under ignored `.tmp`, and can generate fake encrypted escrow output under ignored `.tmp`. It does not switch CMS runtime, write CMS content, write Cosmos data, mutate storage, read protected config, export real secrets, create production escrow payloads, restore data, deploy, index, or publish live pages.

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
- Ice Cosmos seed/migration dry-run writer.
- Approved Cosmos container router.
- `/tenantKey` partition validator for seed dry-run packages.
- Seed readback and rollback plan writers.
- Guarded live Cosmos seed runner with Azure AD/RBAC-only data-plane access.
- Unified complete standard backup generator workflow.
- Live-readonly Ice complete standard backup orchestration.
- Redacted Resource Registry reference inclusion.
- Operator summary and retention/cleanup writers.
- Optional local ZIP download package writer under ignored `.tmp`.
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
npm run cosmos-seed:ice-dry-run
npm run cosmos-seed:validate
npm run cosmos-seed:live-execute
npm run create:complete-standard-fake
npm run create:complete-standard-fake-download
npm run package-download:fake
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
- `BACKUP_GENERATOR.md`
- `COMPLETE_STANDARD_BACKUP_WORKFLOW.md`
- `DOWNLOAD_PACKAGE_WORKFLOW.md`
- `LOCAL_VS_LIVE_READONLY_GENERATOR_MODES.md`
- `OPERATOR_GENERATOR_RUNBOOK.md`
- `STANDARD_BACKUP_FORMAT.md`
- `COSMOS_CONNECTOR_FAKE_MODE.md`
- `MEDIA_CONNECTOR_FAKE_MODE.md`
- `PROVIDER_RESOLVER.md`
- `NON_SECRET_PROVIDER_METADATA.md`
- `PROVIDER_RESOLVER_FIXTURES.md`
- `RUNTIME_PROFILES.md`
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
- `NEXT_BACKUP_GENERATOR_QA_AND_SIGNOFF_PROMPT.md`

## Boundary

Local prototype by default. Seed dry-runs read validated local backup bundles and non-secret fixtures only. The guarded live seed command may use Azure AD/RBAC data-plane access only when explicitly approved, and it blocks before writing if Cosmos native RBAC is unavailable. The live-readonly generator may use only the approved read-only Cosmos export and media copy paths. No real secrets, no protected config, no CMS runtime switch, no CMS writes, no Cosmos writes from the generator, no storage mutation, no MediaAsset restore, no static generation/restore, no production escrow payload, no real restore, no keys/listKeys, no connection strings, no SAS generation, no deployment, no indexing, and no live-page publication.
