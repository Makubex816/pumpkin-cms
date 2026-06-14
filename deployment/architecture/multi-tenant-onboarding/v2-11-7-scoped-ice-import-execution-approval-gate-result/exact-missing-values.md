# Exact Missing Values

The following non-secret values are required before any scoped Ice import execution can be approved:

1. `executionApprovalGranted: true` in a V2.11.6-compatible execution-approved approval manifest.
2. `operatorApproval.approved: true`.
3. `operatorApproval.approvedBy` or equivalent named operator identity.
4. `approvedAt` timestamp.
5. Root-level `approvedBy` value if required by the final manifest contract.
6. Exact `executionBoundary.allowedCommand` or exact repo-supported command name/path for scoped Ice import execution.
7. Exact command arguments that bind only package ID `ice-rink-rentals-carryforward-v2-11-2` and hash `sha256:b0fdd67d5d31e798bf1a9ae3e5f576c17129030cd816e3a8b726b0767002d073`.
8. Exact non-placeholder `targetMode`; it must not be `future_import_candidate`.
9. Exact import target identifier and writable adapter/provider name.
10. Exact pre-write readback command.
11. Exact post-write readback command.
12. Secret-free authorization method, or a separately approved secret-handling method that does not print, copy, export, or commit secret material.

Do not provide secrets in repo docs or prompts. Provide only stable non-secret identifiers, command names, and approval fields.

