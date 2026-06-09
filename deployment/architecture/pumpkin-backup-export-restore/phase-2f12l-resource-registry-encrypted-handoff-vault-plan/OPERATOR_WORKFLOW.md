# Operator Workflow

## Registry Workflow

1. Collect non-secret resource identity from approved evidence.
2. Create or update redacted registry entries.
3. Map resources to tenant/site/runtime profiles.
4. Add credential references by name and purpose only.
5. Validate the registry.
6. Commit only redacted registry files after safety checks.

## Handoff Vault Workflow

1. Request explicit owner approval for vault creation.
2. Confirm allowed credential categories.
3. Confirm output location outside Git or under ignored output.
4. Collect approved sensitive values.
5. Encrypt before handoff.
6. Write manifest, checksums, approval record, and rotation/cleanup instructions.
7. Validate encrypted package.
8. Hand off to owner.
9. Rotate and clean up temporary build credentials.

## Abort Conditions

Abort if:

- Protected config would need to be read without approval.
- A credential value appears in a committable file.
- Vault output would be staged to Git.
- Registry has orphaned credential references.
- Handoff lacks rotation and cleanup instructions.

