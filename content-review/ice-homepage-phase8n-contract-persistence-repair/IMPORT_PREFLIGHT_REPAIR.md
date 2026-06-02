# Import Preflight Repair

Previous issue:
- Import preflight could call the .NET contract tool with `--no-build`, allowing stale binaries to miss the repaired source contract.

Repair:
- `tools/import-preflight/import-preflight.mjs` now builds the .NET contract tool into a temp directory before running validation.
- The preflight report now surfaces `productionFieldPersistenceAvailable` and `productionFieldPersistenceOk`.
- The Phase 8N production candidate now has a local `phase8n-contract-persistence` check before the .NET contract step.

Current preflight result:
- Shape: valid.
- Local draft import shape: valid.
- CMS import: still blocked by business/human approval values.
- Static regeneration: blocked.
- Production: blocked.

This remains non-mutating and does not call CMS write APIs.

