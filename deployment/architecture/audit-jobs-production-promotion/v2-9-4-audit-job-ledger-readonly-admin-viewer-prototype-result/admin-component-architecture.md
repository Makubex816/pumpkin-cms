# Admin Component Architecture

## Component

`AuditJobLedgerAdminView`

## Sections

- Header and read-only safety banner.
- Summary strip.
- Required panel grid.
- Operational coverage blocks.
- Ledger explorer.
- Search/filter/sort controls.
- Record table.
- Read-only detail panel.
- Disabled future-gated action buttons.

## Source Boundaries

The component imports from `@/lib/audit-jobs/mock-provider` and `@/lib/audit-jobs/types`. It does not import `apiClient`, `useAuth`, provider SDKs, or protected config.
