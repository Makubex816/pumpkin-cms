# Rollback And Abort Plan

Phase 2C-1 and the future no-mutation dry run should not change live systems. Because no mutation is allowed, rollback means stopping the workflow and preserving or deleting local artifacts as directed.

## No-Mutation Rollback

If the future dry run must be abandoned:

- stop all work
- do not create a tenant
- do not import CMS records
- do not write MediaAsset records
- do not deploy
- do not change Azure, Cloudflare, DNS, Function App settings, email, Search Console, indexing, or Roller
- preserve redacted evidence if needed for review
- delete local generated artifacts only after the owner/operator confirms they are no longer needed

## Abort Triggers

Abort the pilot if:

- a secret appears in intake, answers, generated package, logs, or support packet
- private customer data appears
- a protected local path is requested or exposed
- the candidate fails required selection criteria
- the owner cannot identify required responsibility owners
- legal/privacy status is blocked
- media rights are blocked
- form recipient ownership is unknown
- validator output contains `blocked` or `failed`
- support packet redaction fails
- someone asks for CMS import, tenant creation, deployment, email, external checks, Search Console, indexing, or Roller changes inside the dry-run gate

## Later Mutation Rollback

Before any future mutation gate, the approval must name:

- exact tenant
- exact action
- systems allowed to change
- systems excluded from change
- rollback owner
- rollback target
- evidence package path
- validation after rollback

No future mutation should proceed without that rollback owner and target.
