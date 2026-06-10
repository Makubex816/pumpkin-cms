# Tenant Partition Validation Result

All generated candidate records used:

- `tenantKey`: `fixture-tenant`
- `siteKey`: `fixture-site`
- `partitionKey`: `fixture-tenant`

The validator enforces `partitionKey === tenantKey` for the local production-candidate contract.

Negative fixture coverage:

- `fixtures/migration-invalid-tenant-mismatch.fixture.json` mutates one candidate to another tenant.
- The validator rejects the mutated output as expected.

Result: tenant partition validation passed.

