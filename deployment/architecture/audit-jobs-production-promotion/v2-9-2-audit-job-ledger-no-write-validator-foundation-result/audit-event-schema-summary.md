# Audit Event Schema Summary

Result: implemented.

The audit event schema is defined in:

```text
deployment/architecture/audit-jobs-production-promotion/audit-job-ledger-implementation/src/audit-job-ledger-schema.mjs
deployment/architecture/audit-jobs-production-promotion/audit-job-ledger-implementation/schemas/audit-event.schema.md
```

Required fields include `auditEventId`, `eventType`, V2/lane/tenant/site IDs, `occurredAt`, `outcome`, `evidenceRefs`, `traceIds`, `actor`, `boundaryClass`, `mutationClass`, and `securityBoundary`.

Supported event taxonomy includes production static deployment, production route verification pass/fail, contact-form verification pass/fail, indexing hard-stop deferral, Runtime QA, Resource Registry, Provider Profile, OLM, Backup Center, rollback/abort, and future boundary records.
