# CLI Operator Workflow

## Planned Commands

These are command designs only. They are not implemented in Phase 2F-1.

```text
pumpkin backup create
pumpkin backup validate
pumpkin backup restore-plan
pumpkin backup escrow-create
pumpkin backup escrow-restore-plan
pumpkin backup list
pumpkin backup cleanup-expired
pumpkin backup support-packet
```

## Example Standard Flow

```text
pumpkin backup create --scope tenant --tenant <tenant-id> --mode standard --reason "<reason>"
pumpkin backup validate --artifact <artifact-id>
pumpkin backup restore-plan --artifact <artifact-id> --target sandbox
```

## Example Escrow Flow

```text
pumpkin backup escrow-create --scope tenant --tenant <tenant-id> --categories <allowlisted-categories> --recipient <fingerprint> --approval <approval-id> --reason "<recovery reason>"
pumpkin backup escrow-restore-plan --artifact <artifact-id> --recipient <fingerprint> --approval <restore-approval-id>
```

## CLI Safety Behavior

- Refuse escrow flags on `backup create` standard mode.
- Require explicit `escrow-create` command for escrow creation.
- Require reason and approval IDs for escrow operations.
- Print redacted presence/status only.
- Never print secret values.
- Default output to private ignored temp storage until artifact publishing completes.

## Operator Handoff

Every command should emit a redacted job summary, validation status, artifact ID, checksum, expiry, and next gate.
