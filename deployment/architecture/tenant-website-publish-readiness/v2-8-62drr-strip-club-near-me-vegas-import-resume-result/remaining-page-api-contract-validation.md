# Remaining-Page API Contract Validation

The scoped validator links the real `DesignSystemGuard.cs`, `PageRedirectGuard.cs`, and Pumpkin page model. It validates required IDs/slugs/tenant scope, duplicate IDs and slugs, payload size, supported blocks, launch holds, canonical FormDefinition references, contact nested shape, and redirect records.

Page-create contract result:

- 43 / 43 package pages valid.
- 26 / 26 remaining pages valid.
- Repaired contact pages: 1.
- Pending pages after contact: 25.
- FormDefinitions visible to reference validation: 32.
- Errors: 0.
- Warnings: 0.

After the live redirect blocker, the validator was extended with `update-pending-pages` operation awareness derived from `PageRevisionHelper`. That replay correctly rejects the two pending self-route redirect updates with 2 errors and 0 warnings. The failed operation-plan result is intentional and keeps import completion blocked.
