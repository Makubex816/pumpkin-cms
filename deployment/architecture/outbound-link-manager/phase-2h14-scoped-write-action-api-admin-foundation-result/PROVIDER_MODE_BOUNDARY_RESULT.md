# Provider Mode Boundary Result

Allowed local write modes:

- `local-simulation`
- `fake-provider`
- `offline-bundle`
- `local-api-fake-provider`

Blocked modes:

- `live-readonly`
- `live-write-approved`
- unknown provider modes

`live-readonly` returns `OUTBOUND_LINK_WRITE_NOT_APPROVED`. `live-write-approved` remains blocked in this phase because no approved live provider profile, migration plan, staging rehearsal, or rollback gate exists.
