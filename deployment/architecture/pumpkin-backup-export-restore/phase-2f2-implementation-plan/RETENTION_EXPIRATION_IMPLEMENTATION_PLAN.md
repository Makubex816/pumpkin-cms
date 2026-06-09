# Retention Expiration Implementation Plan

## Retention Classes

- `pre_write`
- `pre_deployment`
- `routine_tenant`
- `platform_release`
- `recovery_escrow`
- `audit_log`

## Phase 2F-3 Behavior

The local prototype should calculate and write:

- `retentionClass`;
- `createdAt`;
- `expiresAt`;
- `cleanupEligibleAt`;
- `downloadAllowed`.

It should not delete files automatically in the first prototype.

## Future Cleanup Worker

Later cleanup should:

1. mark expired artifacts unavailable;
2. delete private artifacts;
3. preserve audit metadata;
4. write cleanup audit events;
5. fail closed if artifact sensitivity or storage class is unknown.

## Escrow Retention

Escrow artifacts get the shortest default retention and require explicit renewal approval.
