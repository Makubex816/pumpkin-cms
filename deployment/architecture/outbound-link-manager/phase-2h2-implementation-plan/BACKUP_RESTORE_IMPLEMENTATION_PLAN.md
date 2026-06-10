# Backup Restore Implementation Plan

No Backup Center implementation is approved in Phase 2H-2.

## Future Backup Files

Backup Center should eventually include:

- `cms-content/outbound-links.json`
- `cms-content/outbound-link-instances.json`
- `cms-content/outbound-link-policies.json`
- `cms-content/outbound-link-scan-runs.json`
- `cms-content/outbound-link-audit-summary.json`

## Phase Order

1. Local scanner emits registry and instance files.
2. Local validator proves schemas and counts.
3. Backup Center adds outbound link fixture export.
4. Backup validator enforces manifest entries and checksums.
5. Restore-plan compares outbound link counts and disabled state.
6. Live-readonly inventory is considered only after local proof.

## Restore Validation Counts

Restore validation must compare:

- link count;
- instance count;
- domain count;
- disabled link count;
- disabled instance count;
- pending review count;
- stale instance count;
- policy hash or policy field equality.
