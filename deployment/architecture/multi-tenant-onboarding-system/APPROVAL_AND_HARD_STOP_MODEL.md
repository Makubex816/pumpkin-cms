# Approval and Hard Stop Model

## Approval Requirements

An approval must name:

- tenant/site
- exact action
- systems allowed to change
- systems explicitly not allowed to change
- rollback owner
- evidence package path
- whether secrets may be used without being printed

## Hard Stops

The system must block:

- CMS writes without import approval
- MediaAsset writes without media approval
- Azure resource/config changes without Azure approval
- Cloudflare/DNS changes without Cloudflare/DNS approval
- Function App setting changes without form endpoint approval
- deployment without deployment approval
- valid form submissions or email sending without form test approval
- Microsoft 365 changes without email approval
- Search Console/indexing without final indexing approval
- Roller changes while Roller is paused

## Approval Text Pattern

Future tools should require users to approve actions using plain text with the tenant and exact gate, for example:

```text
Approve tenant example-rink-rentals staging preflight only: run local validation and read-only public checks, make no external changes, and keep indexing blocked.
```

