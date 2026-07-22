
# UP-30-A01 — Clean-room qualification of the frozen partner upstream

Status: `complete_frozen_upstream_qualified_with_holds_ready_for_int10`

Frozen upstream commit: `fda4611f6ca5a6206e3e8d6254e3e41c3b50618e`

Frozen upstream tree: `08f1ecdb73c846564c2a0f3de889b66775e8ae5c`

This package records a clean-room qualification of the UP-20-A02 frozen partner upstream snapshot. It did not merge, cherry-pick, rebase, deploy, push, activate live services, or modify downstream product source.

Primary evidence is stored outside the repository at `program-management/upstream-intake/UP-30-A01/evidence`; this repository package contains the repo-safe findings, disposition matrix, Atlas update result, and INT-10 continuation prompt.

Overall disposition: qualified for INT-10 with explicit holds. Source identity, schema-contract checks, exact-SDK .NET build/test, and `pumpkin-ts-models` locked install/build qualified. Block-views, starter/admin, complete Node audit, package distribution, visual/theme runtime proof, and complete deterministic build proof remain held.

Atlas snapshot correction: UP-30 initially generated a distinct successor package while retaining the predecessor version number 3.2.0. Before repository closeout, the successor was regenerated as 3.3.0. The UP-20 v3.2.0 baseline remained unchanged.

Active Atlas successor: v3.3.0, SHA-256 `a15eaa82ba1a8dba9b5a89042c19638d593c336eb6bddaf3610e4fac187aa3a1`. Preserved baseline: v3.2.0, SHA-256 `cf0a43593774a85e45de0706f85a7ceff24219de479a263db216374ab0c69850`.
