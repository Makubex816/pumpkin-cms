# Local Fake Provider Write Mode

Local fake provider mode is the only Admin/API mutation mode wired in this phase.

Accepted local modes:

- `local-simulation`
- `fake-provider`
- `offline-bundle`
- `local-api-fake-provider`

Blocked modes:

- `live-readonly`
- `live-write-approved`
- any unrecognized provider mode

The local package writes only under requested `.tmp` outputs. The Pumpkin API fake provider mutates in-memory fixture state for tests only. The Admin UI produces local/fake preflight responses for operator trace visibility and does not call POST, PUT, PATCH, or DELETE routes.
