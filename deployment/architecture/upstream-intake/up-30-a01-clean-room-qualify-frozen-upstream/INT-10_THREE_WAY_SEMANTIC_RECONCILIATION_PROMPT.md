
# INT-10 — Three-Way Semantic Reconciliation of Frozen Upstream, Current Downstream, and Active Atlas

TASK ID

INT-10 — Three-Way Semantic Reconciliation of Frozen Upstream, Current Downstream, and Active Atlas

AUTHORITY

Start only from the committed downstream branch state that contains the UP-30-A01 result package and the updated ACTIVE_ATLAS_AUTHORITY_POINTER.json.

Inputs:

1. Frozen upstream commit `fda4611f6ca5a6206e3e8d6254e3e41c3b50618e`, tree `08f1ecdb73c846564c2a0f3de889b66775e8ae5c`, from UP-20-A02.
2. UP-30-A01 clean-room qualification package at `deployment/architecture/upstream-intake/up-30-a01-clean-room-qualify-frozen-upstream`.
3. Active Atlas pointer at `deployment/architecture/build-atlas/ACTIVE_ATLAS_AUTHORITY_POINTER.json`.
4. Current downstream source tree on the working branch.

Required entry gates:

1. Working tree and staging must be clean except for explicitly accepted INT-10 work.
2. No active Git operation may exist.
3. The active Atlas pointer must parse and identify Atlas version `3.3.0` or a newer accepted successor.
4. The UP-30-A01 result manifest must parse and report status `complete_frozen_upstream_qualified_with_holds_ready_for_int10`.
5. The frozen upstream commit and tree must match `fda4611f6ca5a6206e3e8d6254e3e41c3b50618e` and `08f1ecdb73c846564c2a0f3de889b66775e8ae5c`.

Scope:

Perform a semantic three-way reconciliation between:

- the frozen partner upstream,
- the current downstream PumpkinCMS implementation,
- and the active Atlas architectural/state authority.

Do not perform a blind merge, cherry-pick, rebase, deployment, push, live Azure operation, indexing activation, payment activation, CAPTCHA activation, or visual-editor activation.

Required outputs:

1. A repo-safe INT-10 result package under `deployment/architecture/upstream-intake/int-10-three-way-semantic-reconciliation/`.
2. A file-by-file and subsystem-by-subsystem reconciliation matrix.
3. A migration/integration plan that separates safe direct ports, semantic rewrites, downstream-preserved behavior, rejected upstream deltas, and items blocked by UP-30 holds.
4. A risk register for identity, data-plane, API/runtime, schema/block contracts, visual editor, unique CSS, theme CSS publishing, FormEntries, CAPTCHA-adjacent behavior, dependency security, and package/distribution readiness.
5. An updated active Atlas status package using the normal static-file workflow.
6. Exact next-step prompt for the first implementation gate after INT-10.

Atlas snapshot correction to carry forward:

UP-30 initially generated a distinct successor package while retaining the predecessor version number 3.2.0. Before repository closeout, the successor was regenerated as 3.3.0. The UP-20 v3.2.0 baseline remained unchanged.

UP-30 holds to carry forward:

- Exact .NET SDK 10.0.100 was not available from the host SDK resolver and was installed locally under the UP-30 outside-repository tools directory for qualification.
- No committed .NET packages.lock.json files were present; exact-SDK locked-mode restore/build/test passed, but NuGet transitive lockfile evidence remains absent.
- The repository root contains a package-lock.json but no root package.json, so root-level npm ci cannot qualify a workspace dependency graph.
- pumpkin-ts-models npm ci and build passed in both clean-room roots, but npm audit reported high-severity dev-dependency advisories for brace-expansion and minimatch.
- pumpkin-block-views has no adjacent package-lock.json; npm ci fails and build cannot resolve tsc under locked restore.
- apps/starter-app has no adjacent package-lock.json; npm ci fails and type-check/build cannot resolve tsc under locked restore.
- npm audit could not be completed for block-views or starter-app because lockfiles are absent.
- No upstream GitHub Actions workflow was present in the frozen source to use as an authoritative CI mirror.
- The local exact-SDK first-run emitted a development certificate installation message; no trust command, live service activation, or deployment was performed.

Completion statuses:

- `complete_three_way_reconciliation_ready_for_implementation_gate`
- `complete_three_way_reconciliation_with_holds_ready_for_owner_decision`
- `rejected_three_way_reconciliation_with_evidence`
- `blocked_entry_gate_or_authority_integrity`
