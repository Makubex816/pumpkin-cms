# Proposed Package Locations

## Options Considered

| Location | Pros | Cons | Recommendation |
| --- | --- | --- | --- |
| `deployment/architecture/pumpkin-backup-export-restore/backup-implementation/` | follows existing validator/builder architecture-adjacent pattern; easy local fixtures/tests; keeps 2F prototype isolated | not final production package location | recommended for Phase 2F-3 |
| `tools/pumpkin-backup/` | natural long-term CLI home; root-level tool discoverability | earlier exposure as active tool before validator hardening | later promotion candidate |
| `apps/pumpkin-api` backup module | required for future API/job integration | too early; adds runtime/API risks before local exporter is proven | defer to Phase 2F-7 |
| `apps/admin` Backup Center UI | required for future operator UI | depends on API/job/RBAC foundation | defer to Phase 2F-7 |
| `deployment/tools/pumpkin-backup/` | deployment-adjacent | less aligned with current local validator/builder layout | not first choice |

## Recommended Phase 2F-3 Local Path

```text
deployment/architecture/pumpkin-backup-export-restore/backup-implementation/
  package.json
  README.md
  src/
    cli.mjs
    index.mjs
    backup-scope-resolver.mjs
    backup-manifest-writer.mjs
    checksum-writer.mjs
    standard-bundle-writer.mjs
    cms-content-exporter.mjs
    database-export-planner.mjs
    media-inventory-exporter.mjs
    static-evidence-exporter.mjs
    config-inventory-redactor.mjs
    backup-validator.mjs
    restore-plan-validator.mjs
    artifact-expiration-planner.mjs
    audit-log-writer.mjs
    escrow-policy-validator.mjs
    escrow-encryptor-interface.mjs
  schemas/
  fixtures/
  test/
  .tmp/
```

## Long-Term Integration Path

After local exporter and validator pass:

- CLI can graduate or be wrapped from `tools/pumpkin-backup/`.
- API controllers can be added under `apps/pumpkin-api`.
- Admin UI screens can be added under `apps/admin`.
- Shared TypeScript model contracts can be added to `packages/pumpkin-ts-models` only after the shape stabilizes.
