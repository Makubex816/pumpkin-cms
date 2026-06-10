# Tenant Partition Validation

Every production candidate record must include:

- `tenantKey`
- `siteKey`
- `partitionKey`

For the current provider-neutral contract, `partitionKey` must equal `tenantKey`, matching the future `/tenantKey` partition plan. The validator fails if any record crosses tenant/site boundaries, omits scope, or uses a mismatched partition key.

The fixture `fixtures/migration-invalid-tenant-mismatch.fixture.json` exists as a negative test. It mutates one generated candidate to prove the validator rejects cross-tenant output before any future provider write could be considered.
