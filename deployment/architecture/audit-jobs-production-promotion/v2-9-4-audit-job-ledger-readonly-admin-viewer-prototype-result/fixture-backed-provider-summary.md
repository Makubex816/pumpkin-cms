# Fixture-Backed Provider Summary

Provider file:

`apps/admin/src/lib/audit-jobs/mock-provider.ts`

## Data Source

`deployment/architecture/audit-jobs-production-promotion/audit-job-ledger-implementation/fixtures/valid-v2-8-combined-promotion-ledger.fixture.json`

## Provider Mode

`admin-local-fixture-readonly`

## Boundary

The provider imports local JSON and derives local objects in memory. It does not call `fetch`, `apiClient`, provider SDKs, `process.env`, or protected config.
