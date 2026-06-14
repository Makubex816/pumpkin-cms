# Risk And Open Decisions

Risks:

- The local builder uses dependency-free structural checks, not a full JSON Schema engine.
- Admin/API intake preview contracts still need a shared DTO and route boundary.
- Future import execution remains undefined and must not be inferred from preview readiness.
- Generated package evidence is local and ignored, so committed proof is the tooling, fixtures, tests, and docs.

Open decisions:

- Whether V2.11.3 should expose previews from package folders, package manifests, or a future package registry.
- Whether future Admin preview should show invalid fixture failures as operator guidance.
- Which audit ledger fields are needed for preview reads before any import execution gate.
