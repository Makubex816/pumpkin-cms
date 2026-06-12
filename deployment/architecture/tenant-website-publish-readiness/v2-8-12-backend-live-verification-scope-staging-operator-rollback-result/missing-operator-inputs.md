# Missing Operator Inputs

Remaining exact inputs:

1. Name the future staging deploy operator.
2. Name the backend verification rollback/abort owner.
3. Confirm any escalation contact if different from the rollback/abort owner.
4. Confirm deployment token/secret storage location outside the repo.
5. Approve exactly one future live backend POST, or confirm dry-run/no-email proof is not sufficient and choose a stronger real-email/provider path.
6. Confirm whether dry-run backend success is enough for staging publish readiness, or whether real email/Pumpkin API persistence must be verified first.
7. Provide separate staging publish execution approval after backend verification is complete.

Still closed unless separately approved:

- DNS mutation;
- Search Console/indexing;
- live publication;
- CMS/provider writes;
- Azure mutation/RBAC;
- external crawling/live-page checks.

