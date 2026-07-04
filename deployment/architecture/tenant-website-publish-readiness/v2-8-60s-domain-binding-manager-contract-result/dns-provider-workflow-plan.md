# DNS Provider Workflow Plan

Status: design complete.

## Provider Modes

`manual_dns_packet`:

- Baseline provider.
- Generates records and owner instructions.
- Owner applies records outside Pumpkin.
- Pumpkin validates observed DNS before binding.

`bluehost_owner_assisted`:

- Owner-assisted Bluehost workflow.
- Supports email-based owner verification outside the stored system.
- One-time codes are never stored.
- Browser automation, if later approved, must pause for owner action and record only non-secret status.

`azure_dns_future`:

- Future provider mode.
- Must not create zones or change nameservers unless separately approved.
- Initial scope should only support existing Azure DNS zones that are already delegated and approved.

`frontdoor_future`:

- Future edge/CDN path.
- Kept separate from basic App Service hostname binding.

## DNS Packet Rules

- Packet includes apex and www records.
- Packet records include type, host, value, purpose, expected target, and notes.
- Packet values that are public DNS verification values may be displayed.
- Provider credentials, private sessions, and owner login details are never stored.
- Packet version history is retained.

## Validation Rules

- DNS observation is read-only.
- Expected and observed records are compared.
- Failure messages must identify the record and observed state.
- DNS validation is required before hostname binding.

