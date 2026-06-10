# Local First Live Readonly Gate Plan

Outbound Link Manager must preserve local-first behavior.

## Modes

| Mode | Purpose | Allowed in first API/Admin phases |
| --- | --- | --- |
| local/offline | Fixture and local store development | yes |
| fake provider | Contract and UI tests | yes |
| import-package readonly | Onboarding package validation | yes |
| tenant-bundle readonly | Bundle validation | yes |
| backup-bundle readonly | Restore and backup validation | yes |
| live-readonly | Approved CMS/API inventory | later explicit approval |
| live-write-approved | Production persistence writes | later explicit approval only |

## Gate Requirements

- Mode must be explicit in API service configuration.
- Read-only mode must reject mutating endpoints.
- Local mode must not read protected config.
- Live-readonly mode must not call POST, PUT, PATCH, or DELETE endpoints.
- Live-write-approved mode must require backup readiness, audit logging, reason text, role permission, and conflict handling.

## Operator UX

Admin should display the current mode clearly:

- local/fake
- live-readonly
- write-approved
- blocked

Mode changes should not be inferred from environment defaults.

