# Job Run Schema Summary

Result: implemented.

The job run schema is defined in:

```text
deployment/architecture/audit-jobs-production-promotion/audit-job-ledger-implementation/src/audit-job-ledger-schema.mjs
deployment/architecture/audit-jobs-production-promotion/audit-job-ledger-implementation/schemas/job-run.schema.md
```

Required fields include `jobRunId`, `jobType`, V2/lane/tenant/site IDs, timestamps, `status`, `outcome`, input/output/validation evidence refs, audit event refs, and `securityBoundary`.

Supported job types include static validation, Runtime QA, Resource Registry, Provider Profile, OLM validation, production deployment attempt records, production route check records, contact-form verification records, indexing deferral records, and rollback/abort plan review.
