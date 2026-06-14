# Operator Next Actions

To unblock scoped Ice execution, provide or approve the following:

1. A V2.11.6-compatible execution-approved Ice approval manifest with `executionApprovalGranted: true`, `operatorApproval.approved: true`, `approvedAt`, `approvedBy`, package ID `ice-rink-rentals-carryforward-v2-11-2`, and package hash `sha256:b0fdd67d5d31e798bf1a9ae3e5f576c17129030cd816e3a8b726b0767002d073`.
2. Exact non-secret target identifier and target mode for the import.
3. Exact repo-supported scoped write command, or explicit approval to implement a scoped local execution helper in `deployment/architecture/multi-tenant-onboarding/import-package-governance-implementation/`.
4. Exact repo-supported pre-write and post-write readback commands, or explicit approval to implement a scoped readback helper.
5. Confirmation that Roller remains paused/no-import/no-resume and is not part of the execution.
6. Confirmation that deployment, DNS/custom-domain, Google/Search Console/indexing, contact POST, Azure infrastructure/config mutation, RBAC, protected config reads, keys/listKeys, connection strings, SAS, and compressed archives remain out of scope.

Suggested next approval: V2.11.7A Scoped Ice Import Execution Manifest And Target Command Binding Closure.

