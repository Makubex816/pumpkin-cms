# Resource Registry Production Binding Checklist

Status: candidate only.

Candidate dry-run binding:

- provider type: `cosmos-nosql-candidate`
- environment: `production-candidate`
- account reference: `resource-registry:cosmos-pumpkin-prod-eastus`
- database: `pumpkin-prod-cms`
- credential reference ID: `credential-reference-outbound-link-production-no-value`
- credential value included: false

Required before production migration:

- approved production provider profile ID
- approved concrete production provider type
- approved production resource group or scope
- approved account or host name
- approved database or namespace
- approved credential reference without values
- production readback method
- production rollback method
- operator approval reference

No Resource Registry write occurred in this phase.
