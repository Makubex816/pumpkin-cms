# Product data contracts and state machines

## Repository contracts

The productization source defines versioned, tenant-neutral contracts for:

- accepted product releases;
- tenant publication snapshots and deterministic static artifacts;
- public publications and origin bindings;
- frontend resource and domain-readiness metadata;
- secure deployment-credential references without values;
- publication jobs, steps, attempts, resumes, rollbacks, and redacted audits.

Hosting classes are `STATIC_PUBLISHED_SITE`, `DYNAMIC_SCALE_TO_ZERO_FRONTEND`, and `SHARED_RUNTIME_COMPATIBILITY`.

Publication states are `DRAFT`, `PLANNED`, `BUILDING`, `READY`, `DEPLOYING`, `ACTIVE`, `SUPERSEDED`, `REVOKED`, `FAILED`, `ROLLED_BACK`, and `ARCHIVED`. Explicit transition validation rejects unsupported transitions.

Publication modes are `HELD_NOINDEX`, `PUBLIC_NOINDEX`, and `PUBLIC_INDEXABLE_OWNER_APPROVAL_REQUIRED`; forms are `PREVIEW_NO_POST` or `PUBLIC_FORMS_LIVE`. No code path grants indexable execution without a later owner gate.

## Jobs

The generic orchestrator has 16 ordered steps with stable IDs, a canonical plan hash, dependency edges, explicit approval references, no-op planning, idempotency conflict detection, partial-success preservation, resume records, reverse-order rollback, and redacted event history. TenantAdmin requests are tenant-bound; SuperAdmin requests are explicitly distinguished.

The API product records accepted releases, immutable artifact metadata, product jobs, bindings, holds, and audits in the existing public-publication aggregate. This avoids a cosmetic live-container migration while retaining tenant-partitioned reads and optimistic revision checks. Cosmos and Mongo adapters expose the same publication read/write interface.

## Acceptance result

The source contracts are frozen at `aab6823bd265cf91e77868a6649dd984016837b9`. The 46-test publication-product validator passed with `networkCalls: 0` and `liveMutation: false` in the final source and both isolated clean roots. The .NET API restored, built, and tested under the Mongo-enabled and Cosmos-only graphs in both roots with zero warnings and zero errors. No live registry record was created by PUB-30.
