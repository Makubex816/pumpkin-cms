# Restore Validation Preflight Plan

## Future Validation Stages

The Ice full backup execution must validate:

1. Manifest parse and schema.
2. Checksum completeness.
3. File-list completeness.
4. Standard-mode secret exclusion.
5. CMS content export shape.
6. Database artifact presence and integrity.
7. Media inventory and optional copy integrity.
8. Static evidence inventory.
9. Redacted config inventory.
10. Restore-plan dry-run output.
11. Human-readable validation report.

## Expected Inventory Counts

The restore validation plan should compare:

- 1 Ice tenant;
- 1 Ice site;
- 3 approved live routes;
- obsolete route evidence for 2 known 404 routes;
- CMS page count from exported records;
- form definition count from exported records;
- MediaAsset count from exported records;
- static evidence file count from backup manifest;
- database artifact count or platform backup evidence count.

## Restore Target Boundary

The restore plan must target local/sandbox validation only. It must not restore into production, change CMS records, change media assets, change DNS, deploy, or index.

## Required Reports

Future execution should produce:

- `RESTORE_INSTRUCTIONS.md`;
- restore-plan JSON;
- restore validation JSON;
- restore validation Markdown;
- go/no-go recommendation for any later restore drill.

## Abort Rules

Abort and report if:

- manifest validation fails;
- checksums fail;
- database artifact is missing or unencrypted when portable;
- CMS export does not match route/page expectations;
- media references are missing;
- static evidence is incomplete;
- protected config or secret-like values appear in standard backup;
- restore target overlaps production or source artifact directories.

## Phase 2F-7 Boundary

No restore plan was run against real Ice data and no restore into any real system occurred.
