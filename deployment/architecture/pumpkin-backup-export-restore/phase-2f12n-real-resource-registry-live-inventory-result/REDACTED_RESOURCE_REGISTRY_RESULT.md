# Redacted Resource Registry Result

Committed redacted input fixture:

`deployment/architecture/pumpkin-backup-export-restore/resource-registry-implementation/fixtures/resource-registry.real-readonly-current.fixture.json`

Generated registry output:

`deployment/architecture/pumpkin-backup-export-restore/resource-registry-implementation/.tmp/phase-2f12n-real-redacted-registry/`

Validation result:

- registry generation: passed
- registry validation: passed

Registry counts:

- resources: 20
- credential references: 9
- tenant mappings: 2
- runtime profiles: 3

Tenant mappings:

- `ice-rink-rentals`: active
- `roller-rink-rentals`: paused

Runtime mappings:

- `runtime-cosmos-future`: blocked; future Cosmos target is provisioned but not runtime-switched
- `local-with-live-readonly`: blocked; metadata-only inventory, no CMS/API writes
- `offline-bundle`: planned; local-first/offline workflow
