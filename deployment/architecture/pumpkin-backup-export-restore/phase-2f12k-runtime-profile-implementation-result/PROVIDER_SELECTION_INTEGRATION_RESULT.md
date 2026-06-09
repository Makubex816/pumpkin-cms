# Provider Selection Integration Result

## Implemented Mapping

Provider resolver output now maps into runtime profile classification:

- Local/file-backed provider -> `local-dev`
- Missing or blocked source -> blocked local planning state
- Configured/discovered Cosmos -> `live-readonly` planning state
- Provisioned future-target Cosmos -> `runtime-cosmos-future`
- Explicit future write profile -> `production-write-approved`, still blocked

## Ice Mapping

Ice future-target/provisioned Cosmos maps to `runtime-cosmos-future`.

It does not map to:

- `runtime-configured`
- live database export allowed
- runtime switch allowed
- production writes allowed

## Reason Codes

Runtime profile results expose reason codes for blocked live export, including:

- `future-runtime-profile-not-active`
- `provider-is-future-target-not-active-runtime`
- `runtime-not-configured`
- `seed-migration-gate-not-passed`
- `runtime-switch-gate-not-approved`
- `live-database-export-not-approved`

