# Complete Backup Output Result

Fake complete bundle:

| Field | Value |
| --- | --- |
| Path | `.tmp/phase-2f13-unified-backup-generator/fake-complete/` |
| Profile | `fake-complete` |
| Content file count | 49 |
| Database component | complete |
| Media component | complete |
| Includes escrow | false |
| Validator result | passed |
| Restore-plan result | passed |

Live-readonly Ice complete bundle:

| Field | Value |
| --- | --- |
| Path | `.tmp/phase-2f13-unified-backup-generator/ice-complete-standard/` |
| Profile | `live-readonly` |
| Content file count | 57 |
| Database component | complete |
| Media component | complete |
| Cosmos proof | exported-and-validated |
| Media proof | copied-and-validated |
| Includes escrow | false |
| Validator result | passed |
| Restore-plan result | passed |

Bundle product files added by the generator:

- `resource-registry/resource-registry-reference.json`
- `resource-registry/RESOURCE_REGISTRY_REFERENCE.md`
- `operator/generator-result.json`
- `operator/OPERATOR_SUMMARY.md`
- `operator/RETENTION_AND_CLEANUP.md`
- `RESTORE_PLAN.md`

The complete bundle remains a folder-format standard backup. The optional ZIP is a separate convenience package under `.tmp`.
