# Production Provider Profile Requirements

Status: missing approved production profile.

Required profile properties:

- providerProfileId
- providerType
- providerMode
- environmentName
- resourceGroupOrScope
- accountOrHostName
- databaseOrNamespace
- partition key
- credential reference ID without values
- authMode
- identityOrSessionType
- target containers for all 10 OLM entities
- readbackMethod
- rollbackMethod
- Backup Center evidence reference
- Resource Registry production binding reference

Current reusable fixture:

- profile name: `phase-2h17-production-candidate-dry-run`
- mode: `local-to-production-dry-run`
- environment: `production-candidate`
- writes: false

The fixture is acceptable for no-write dry-run validation only. It is not an approved production execution profile.
