# Database Migration Strategy

No database migration is approved in Phase 2H-2 or Phase 2H-3.

## Migration Gate Order

1. Local scanner and registry foundation passes.
2. Schema and fixture validation passes.
3. Backup/restore contract is updated and validated locally.
4. Renderer snapshot contract is proven locally.
5. API/Admin implementation plan is refreshed.
6. Provider selection is confirmed.
7. Owner approves migration dry-run.
8. Owner approves guarded migration execution.

## Candidate Persistence Models

Cosmos candidate:

- containers for outbound links, instances, policies, scan runs, audit logs;
- partition by `/tenantKey` or equivalent tenant key;
- use site id in query filters and indexes.

Relational candidate:

- tables named after architecture entities;
- composite unique keys for tenant/site/normalized URL;
- foreign keys from instances to links.

## Migration Safety

- Never infer migration writes from scanner output without owner review.
- Import disabled states exactly.
- Preserve audit source metadata.
- Stop on duplicate normalized URL conflicts.
- Stop if tenant scope is missing or mismatched.
