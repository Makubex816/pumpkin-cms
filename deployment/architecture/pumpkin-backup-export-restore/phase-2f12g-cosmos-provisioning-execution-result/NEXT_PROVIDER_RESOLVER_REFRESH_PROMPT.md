# Next Provider Resolver Refresh Prompt

Provider resolver refresh is ready for a later read-only approval. The Cosmos account, database, and containers now exist, but the application runtime is not wired and no data has been migrated.

Use this as the next approval prompt:

```text
Approve Phase 2F-12H Ice provider resolver refresh after Cosmos provisioning only: use the Phase 2F-12G provisioning result to perform read-only provider resolver metadata refresh for IceSkatingRinkRentals.com, verify non-secret Cosmos account/database/container metadata, verify backup policy and `/tenantKey` partitioning evidence, update Backup Center handoff documentation, and produce a go/no-go recommendation for live database connector execution planning. No keys/listKeys, no connection strings, no SAS generation, no protected config reads, no CMS writes, no data migration, no database export/import, no deployment, no Search Console/indexing, and no live-page publication.
```

This prompt must remain read-only. It does not approve CMS runtime wiring, data migration, database export/import, RBAC mutation, deployment, or live-page publication.

