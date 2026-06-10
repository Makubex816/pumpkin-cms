# Seed Manifest Result

Seed manifest:

- `deployment/architecture/pumpkin-backup-export-restore/backup-implementation/.tmp/phase-2f12o-ice-cosmos-seed-dry-run/seed-manifest.json`

Manifest status: valid

Target metadata:

- Provider: Cosmos
- Provider status: future target
- Account: `cosmos-pumpkin-prod-eastus`
- Resource group: `rg-ice-production-cosmos`
- Database: `pumpkin-prod-cms`
- Partition key path: `/tenantKey`
- Backup policy mode: `Continuous30Days`

Manifest boundaries mark live Cosmos writes, CMS writes, runtime switch, database export, media download, Azure calls, protected config reads, deployment, Search Console/indexing, and live-page publication as false.
