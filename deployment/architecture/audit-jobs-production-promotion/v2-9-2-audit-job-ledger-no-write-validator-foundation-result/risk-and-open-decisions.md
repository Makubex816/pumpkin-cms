# Risk And Open Decisions

Result: recorded.

Open decisions:

- Whether V2.9.3 should remain documentation/planning for a read-only operator viewer or begin a local prototype.
- Whether future ledgers should be stored as JSON files, generated snapshots, or a read-only runtime feed.
- Whether the validator should later emit machine-readable `.tmp` reports. V2.9.2 intentionally avoids generated evidence files.
- Whether failed production route/contact event fixtures should be added when a future incident package exists.

Risks:

- The current validator is fixture-oriented and not yet wired to runtime job systems.
- Promotion gate types are validated structurally but not yet mapped to a full operator dashboard state model.
- Historical live actions are represented safely as evidence summaries; future runtime integration must keep the distinction between historical evidence and current execution explicit.

No risk requires crossing the current no-write boundary.
