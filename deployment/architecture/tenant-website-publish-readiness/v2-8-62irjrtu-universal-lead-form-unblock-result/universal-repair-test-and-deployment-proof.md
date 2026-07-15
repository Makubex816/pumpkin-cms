# Universal repair, tests, and deployments

The repair adds persisted submission/correlation/idempotency fields; deterministic FormEntry identity; Cosmos create-or-return-existing conflict handling; Mongo duplicate-key recovery; 10/15/25-second API/starter/browser bounds; structured success/failure responses; authenticated no-write preflight; tenant-scoped readback filtering; and prompt non-2xx forwarding.

API Release build, starter type-check/build, fixture accounting, host isolation, Party Pros, deployment completeness, and focused reliability tests passed. The clean API worktree exposed pre-existing committed references to unrelated untracked service files, so packaging used the verified main-tree Release build without staging or modifying those user files.

API deployments `249e9e81-1152-40ea-8e80-e2446469236d` and corrected `b628e520-02c3-42bb-809f-e51746ef0531` succeeded. Starter deployment `80017b20-f831-44a6-a359-e1f035ef557d` succeeded.
