# Validation Gates

## Pre-Provisioning Gates

- owner-confirmed scope worksheet complete;
- backup policy decision complete;
- partitioning/tenant isolation accepted;
- RBAC model accepted;
- metadata endpoint implementation plan accepted;
- provider resolver integration plan accepted;
- seed/migration prerequisites accepted;
- rollback/abort plan accepted.

## Provisioning Execution Gates

Provisioning execution remains blocked until a later approval explicitly allows Azure mutation.

Required execution evidence after that future approval:

- Cosmos account created as approved;
- database created as approved;
- containers created as approved;
- backup policy matches decision;
- RBAC assignments match plan;
- no key/listKeys/SAS dependency introduced.

## Post-Provisioning Gates

- non-secret metadata endpoint implemented;
- provider resolver reads verified metadata;
- provider status moves to `configured` only after read-only verification;
- CMS runtime wiring is separately approved and verified;
- seed/migration is separately approved and verified;
- live export remains blocked until export approval.
