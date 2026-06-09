# Restore Plan Update Plan

## Purpose

The restore-plan dry run should explain how a validated Ice tenant website bundle could be restored later without performing a real restore.

## New Restore Plan Sections

- Database provider summary.
- Cosmos platform restore evidence summary.
- Cosmos portable JSON import plan.
- Collection dependency order.
- Tenant/site identity preservation plan.
- Route and page reconciliation plan.
- Media metadata restore plan.
- Blob restore/copy-back plan.
- Static evidence verification.
- Config inventory review.
- Owner-decision exclusions.
- Abort rules.

## Cosmos Restore Planning

The dry run should order logical records so identity and ownership are restored before dependent content:

1. Tenant metadata.
2. Site metadata.
3. Theme/layout records.
4. Routes.
5. Pages.
6. MediaAsset metadata.
7. Form recipient configuration.
8. Publish/import provenance.
9. Owner-approved optional records.

The dry run must not call Cosmos APIs or write data.

## Media Restore Planning

The dry run should classify media status:

- `metadata-only`: media metadata exists, but blobs are not backed up.
- `inventory-only`: blob inventory exists, but content is not copied.
- `full-copy`: blobs are available in the bundle and checksummed.
- `provider-native`: accepted platform backup/copy evidence exists.
- `blocked`: media source could not be proven.

## Restore Abort Rules

Abort a future restore attempt if:

- Backup validation fails.
- Tenant scope is ambiguous.
- Checksums fail.
- Required blobs are missing.
- Cosmos export contains unclassified sensitive records.
- Route ownership conflicts are unresolved.
- Operator approval is missing.
- Target environment is not explicitly selected.

## Output Contract

```text
restore/
  restore-plan.json
  restore-plan.md
  restore-inventory-diff.json
```

The restore plan must remain a dry run until a separate restore execution approval exists.
