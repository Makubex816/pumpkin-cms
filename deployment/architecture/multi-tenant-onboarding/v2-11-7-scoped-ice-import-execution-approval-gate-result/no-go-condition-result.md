# No-Go Condition Result

Ice package-local dry-run no-go conditions: none.

Ice execution no-go conditions in V2.11.7:

- `execution_approval_not_granted`.
- `execution_approved_manifest_missing`.
- `operator_approval_missing`.
- `approved_at_missing`.
- `approved_by_missing`.
- `exact_target_unresolved`.
- `repo_supported_write_command_missing`.
- `repo_supported_readback_command_missing`.

Roller no-go conditions:

- `tenant_paused_no_import`.

Because at least one Ice execution no-go condition is true, no import execution occurred.

