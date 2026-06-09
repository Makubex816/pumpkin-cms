# Rotation and Cleanup Plan

## Rotation Rules

Every credential reference should define:

- Whether rotation is required
- Rotation cadence
- Rotation owner
- Rotation trigger
- Last verification timestamp
- Cleanup instructions

## Build Handoff Rotation

After a build handoff:

1. Confirm the owner received the encrypted vault.
2. Confirm the owner can validate checksums.
3. Rotate temporary build credentials.
4. Remove temporary operator access.
5. Mark retired credentials in the registry.
6. Record cleanup audit events.

## Cleanup Rules

Cleanup is required for:

- Temporary deployment tokens
- Temporary local vault artifacts
- Unused resource groups
- Retired DNS records
- Retired runtime profiles
- Old backup artifacts beyond retention

## Non-Rotation Rule

Session cookies and short-lived browser tokens should not be stored for rotation. They should expire or be regenerated.

