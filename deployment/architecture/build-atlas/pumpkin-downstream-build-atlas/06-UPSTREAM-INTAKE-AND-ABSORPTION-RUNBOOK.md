# Upstream Intake and Downstream Reconciliation Runbook

## Intake candidate

```text
repository: SDI-AI/pumpkin-cms
previous observed head: 785e079269276c177832f9e7186ae44675e76f52
new observed head: 18b5cea01d23298b95b5945999e66a4aec8d748b
observed delta: 5 commits / 43 changed paths
source status: observed_unqualified
```

## Step 1 — Preserve downstream first

Before fetch/merge/rebase/cherry-pick:

- record every local repository, remote, branch, tag, worktree, submodule, stash, and untracked path;
- create a local Git bundle of all refs;
- capture active deployment source and current Atlas;
- capture worktree/staging state and hashes;
- block if any work cannot be reconstructed.

## Step 2 — Ingest current phase closeout

The current build may contain changes not visible publicly. It must become the baseline before semantic reconciliation. Use `29-CURRENT-BUILD-CLOSEOUT-INGESTION-GATE.md`.

## Step 3 — Recheck upstream

Do not freeze from an old observation. Fetch and verify:

```bash
git fetch upstream main --prune
candidate=$(git rev-parse upstream/main)
git show --no-patch --format=fuller "$candidate"
git cat-file -p "$candidate"
git merge-base --is-ancestor 785e079269276c177832f9e7186ae44675e76f52 "$candidate"
```

If the candidate differs from `18b5cea01d23298b95b5945999e66a4aec8d748b`, generate a new intake report and repeat classification.

## Step 4 — Freeze exact source

Only after preservation and owner-authorized Git writes:

```bash
git branch immutable/upstream/2026-07-15-${candidate:0:12} "$candidate"
git tag -a upstream-snapshot/2026-07-15-${candidate:0:12} "$candidate" -m "Immutable upstream source snapshot"
git archive --format=tar.gz --output upstream-${candidate:0:12}.tar.gz "$candidate"
git bundle create upstream-${candidate:0:12}.bundle "$candidate"
sha256sum upstream-${candidate:0:12}.*
```

Apply protected rules before treating remote references as immutable.

## Step 5 — Qualify from a clean clone/worktree

- use only the frozen commit;
- restore exact dependencies;
- explicitly run the custom .NET contract tests;
- build/type-check/lint all Node packages/apps;
- scan and hash artifacts;
- capture toolchain versions;
- do not infer passing CI from the merge commit because no attached status/workflow proof was observed.

## Step 6 — Classify changed subsystems

Use `31-UPSTREAM-CHANGE-DECISION-REGISTER.md`. Classification is behavior based, not path based.

## Step 7 — Reconcile in ordered slices

Recommended order:

```text
models and serialization
→ API contracts/tests
→ CAPTCHA verifier and form resolution
→ shared widget/renderers
→ block identity migration
→ visual editor and preview
→ navigation/header media
→ downstream role/control-plane adapters
→ tenant reconciliation
```

Each slice receives source tests, downstream tests, migration proof, no-regression proof, rollback notes, and Atlas updates.

## No blind merge rule

A clean Git merge is not semantic proof. A conflict-free diff can still change tenant scope, authentication, data ownership, caching, or persistence behavior.
