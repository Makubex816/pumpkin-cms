# Provider Mode Write Boundaries

Provider mode is a hard gate before any write simulation.

`local-simulation`, `fake-provider`, `offline-bundle`, and `local-api-fake-provider` can proceed through local guards and sandbox mutation.

`live-readonly` returns `OUTBOUND_LINK_WRITE_NOT_APPROVED`.

`live-write-approved` returns `OUTBOUND_LINK_LIVE_WRITE_BLOCKED` in this phase because no approved live provider profile, migration gate, staging validation, or rollback operator package is present.

Provider-mode decisions are included in every API-style response and trace log.
