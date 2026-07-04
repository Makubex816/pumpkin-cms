# Bluehost Provider Plan

Status: design complete.

Bluehost is the first owner-assisted provider mode for Airstrip.

## Baseline Behavior

- Generate a Bluehost-friendly DNS packet.
- Show owner action instructions.
- Record that Bluehost is the selected provider.
- Validate public DNS after owner action.
- Do not store owner login details.
- Do not store one-time verification codes.

## Owner-Assisted Flow

1. SuperAdmin creates binding in `pending_owner_approval`.
2. System generates Bluehost DNS packet.
3. Owner applies records or participates in an assisted session.
4. Operator marks records as applied after owner confirmation.
5. System validates DNS.
6. Azure hostname binding proceeds only after DNS validation passes.

## Automation Boundary

Future browser automation must remain opt-in and approval-gated. If browser automation fails, the manager should still produce a manual packet and owner instructions.

## Airstrip Packet Reference

The existing Airstrip Bluehost packet remains the preserved input for first use:

- `deployment/architecture/pumpkin-platform/PUMPKIN_AIRSTRIP_BLUEHOST_DNS_PACKET_V2_8_60.md`

V2.8.60S did not mutate Bluehost records.

