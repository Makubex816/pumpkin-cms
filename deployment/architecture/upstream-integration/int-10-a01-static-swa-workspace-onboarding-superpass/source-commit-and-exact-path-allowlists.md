# Source commit and exact-path allowlists

Checkpoint commit model:

- Commit 1 stages only this INT-10 result package.
- Later root workspace commit may stage only root package metadata/lockfile and focused workspace package metadata/tests.
- Later static/onboarding commit may stage only exact source, schema, tool, fixture, and test paths created for deterministic static publication and no-op onboarding dry-run.
- Final closeout may stage only active Atlas pointer files, exact INT-10 result package files, and allowed Atlas/working-memory generated documents.

Forbidden: `git add -A`.
