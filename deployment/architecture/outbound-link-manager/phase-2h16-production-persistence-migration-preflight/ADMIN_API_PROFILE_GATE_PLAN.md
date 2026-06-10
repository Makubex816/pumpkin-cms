# Admin/API Profile Gate Plan

Admin and API must keep provider profiles explicit.

Profile gate behavior:

- `local-dev`: local fixtures only
- `fake-provider`: test fixtures only
- `offline-bundle`: tenant package input only
- `local-file-backed`: local `.tmp` store only
- `local-api-fake-provider`: simulated Admin/API write behavior only
- `live-readonly`: production read provider only, no writes
- `live-write-approved`: blocked unless future explicit approval and validation exist
- `production-runtime`: runtime read profile only after migration approval

Admin requirements:

- show provider mode in dashboard and detail workflows
- keep write buttons disabled unless action is local/fake or explicitly approved
- display trace IDs and rollback IDs for local/fake preflight
- never infer live-write-approved from live-readonly

API requirements:

- reject missing provider mode
- reject write attempts in live-readonly
- reject live-write-approved until future gate exists
- require tenant/site/role/reason/approval checks for all writes
- return traceable response envelopes for blocked and applied actions
