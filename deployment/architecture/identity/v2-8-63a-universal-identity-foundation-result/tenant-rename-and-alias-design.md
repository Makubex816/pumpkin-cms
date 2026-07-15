# Tenant rename and alias design

`tenantUid` is immutable and is the relationship/partition key. `tenantSlug` is canonical and mutable; legacy `tenantId` remains serialized. Rename is never a direct edit.

Preflight validates syntax/reserved words, uniqueness and alias collisions, tenant status, concurrent jobs, imports/publishes, counts of pages/forms/entries/redirects/domains/memberships, fixtures/custom hosts, runtime keys, storage paths, backup manifests, DNS/register/hardcopy references and integrations.

Execution steps are idempotent and resumable: reserve slug; write job; establish new canonical slug; write permanent old-slug alias; refresh alias-aware routes/registries/caches; validate custom domains, FormEntries, memberships, credentials and media remain stable; complete audit; expose rollback. UID never changes and blobs are not moved merely because a slug changes. V2.8.63A supplies the model, validation primitive, routes and disabled execution flag only.
