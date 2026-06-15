# Staging To Production Mapping Review

Status: no-write mapping validated by local dry-run.

Source evidence:

- staging readback count: `48`
- dry-run migration candidate count: `48`
- migrationRunId: `olmr_phase_2h17_fixture`
- validation failures: `0`
- validation warnings: `0`

Candidate target:

- provider type: `cosmos-nosql-candidate`
- account reference: `resource-registry:cosmos-pumpkin-prod-eastus`
- database: `pumpkin-prod-cms`
- partition key: `/tenantKey`

The mapping is production-shaped, but the target remains candidate-only until an approved production provider binding is supplied.
