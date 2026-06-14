# Roller Paused Dry-Run Result

Status: blocked as expected.

Dry-run ID: `dry-run-roller-rink-rentals-paused-preview-v2-11-2-v2-11-6`.

Result:

- `dryRunAllowed`: `false`.
- `targetMode`: `blocked_no_import_no_resume`.
- `executionMode`: `no_write_dry_run`.
- `futureExecutionAllowed`: `false`.
- Future execution blocker: `execution_approval_not_granted`.
- No-go conditions: `tenant_paused_no_import`.

Roller remains paused. No resume approval exists. No import, tenant creation, CMS/provider write, deployment, indexing, contact POST, or Azure mutation occurred.

