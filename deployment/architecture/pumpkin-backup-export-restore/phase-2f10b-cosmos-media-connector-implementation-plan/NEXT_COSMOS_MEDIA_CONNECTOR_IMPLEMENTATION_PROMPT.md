# Next Cosmos/Media Connector Implementation Prompt

Approve Phase 2F-11 Ice Cosmos/media backup connector foundation implementation only: using the Phase 2F-10B connector implementation plan, implement the local fixture-first Backup Center connector foundation for Cosmos/provider database and Azure Blob media sources under `deployment/architecture/pumpkin-backup-export-restore/backup-implementation/`, including explicit profile resolution, presence-only env readiness checks, fake Cosmos discovery fixtures, fake Cosmos platform backup evidence, fake tenant-scoped portable JSON export fixtures, fake media blob-map/inventory/copy fixtures under ignored `.tmp` output, tenant website bundle integration, manifest/checksum updates, validator modes, restore-plan dry-run updates, docs, tests, and a result package.

No real Cosmos export, no live blob listing unless separately approved, no blob download, no protected config reads, no secret export, no Azure mutation, no CMS writes, no MediaAsset writes, no database import/export against production, no deployment, no Search Console/indexing, no live-page publication, no staging of generated `.tmp` artifacts, and no staging or committing of any file containing secrets.

Required hard stops:

- Abort if a command would read protected config.
- Abort if tenant scope is missing.
- Abort if a connector would print env values.
- Abort if a live provider action is requested outside the approved profile.
- Keep standard backup secret-exclusion validation strict.
