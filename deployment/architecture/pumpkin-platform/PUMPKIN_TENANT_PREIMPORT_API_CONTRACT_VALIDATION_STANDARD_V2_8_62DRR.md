# Pumpkin Tenant Pre-Import API Contract Validation Standard V2.8.62DRR

## Rule

Every object in a tenant import must pass the exact API operation and persistence contract before the first dependent live mutation. Generic schema validation alone is insufficient.

## Required Gates

1. Resolve the concrete create, update, or delete route that each planned operation will use.
2. Deserialize with the production model and converters.
3. Run the production guards used by that route.
4. Model persistence transformations, merge helpers, normalization, and collision checks used after validation.
5. Validate required fields, tenant scope, IDs, slugs, duplicates, serialized size, block support, references, launch holds, and object-specific nested contracts.
6. Validate contact/form pages against canonical FormDefinitions and every effective instance mapping without embedding duplicates.
7. Validate redirect ownership and application stage. A redirect accepted on create is not proof that the same record survives update.
8. Require zero errors and zero warnings for every planned object before live mutation.
9. Produce an ordered, immutable operation manifest and expected readback.
10. Read back every write; attempt counters never substitute for persisted state.

## DRR Implementation

The durable validator under `tenant-onboarding-package/v1/tools/page-contract-validator` links Pumpkin models, `DesignSystemGuard`, and `PageRedirectGuard`. Its operation-aware redirect mode also models the relevant `PageRevisionHelper` self-route filter. Focused fixtures prove valid input passes and missing contact blocks, duplicate IDs, unknown blocks, unknown form references, and incompatible pending redirect updates fail.
