# Provider Profile Model

The Phase 2H-19 provider profile describes a target persistence mode without exposing credentials or enabling live writes.

## Required Shape

- `schemaVersion`: currently `0.1.0`
- `providerProfileId`: stable fixture/profile identifier
- `providerMode`: one of the known local, staging, live-readonly, or future live-write modes
- `targetProvider`: redacted provider metadata and `/tenantKey` partition key
- `targetContainers`: production-shaped outbound-link container mapping
- `credentialReferences`: reference IDs only, never credential values
- `capabilities`: whether the profile can plan writes, perform reads, or perform live writes
- `boundaries`: explicit false values for protected config reads, live writes, CMS writes, external crawling, deployment, indexing, and live publication

## Supported Fixture Modes

- `local-dev`
- `fake-provider`
- `offline-bundle`
- `local-file-backed`
- `local-api-fake-provider`
- `staging-simulated`
- `live-readonly`
- `live-write-approved`
- `production-runtime`

`staging-simulated` is the only Phase 2H-19 profile intended to produce apply-plan dry-run records. `live-readonly`, `live-write-approved`, and `production-runtime` remain blocked for write planning.

## Credential Boundary

Profiles must set `credentialValueIncluded` to false and may contain only credential reference IDs. The validator rejects secret-like values, connection-string style values, SAS-like values, account-key text, and protected-config paths.

