# Safe Next Phase Map

Recommended next phase:

Approve V2.8.61P New Tenant Intake Values Review and Package Analyzer Preflight only after the owner completes `.tmp/v2-8-61o/owner-input/new-tenant-intake-owner-values.json`.

Allowed:

- Read completed owner-values template.
- Confirm source package path exists.
- Run package analyzer only if explicit analysis-only approval exists.
- Produce analyzer proof or owner action packet.

Not approved:

- Tenant creation.
- Media upload.
- Record import.
- Deploy or preview deploy.
- DNS/custom-domain mutation.
- Contact POST, form submission, or customer-facing POST proof.
- Airstrip probing or mutation.
- Worktree cleanup execution.

Optional separate phase:

TenantAdmin Auth Boundary GET-Only Proof, only if approved TenantAdmin credentials are provided through a secure ignored path.

Build hygiene carryforward:

Approve a narrow Admin build repair phase if a green Admin type-check/build is required before the next deploy. Scope should be limited to the existing `form-builder`, `themes`, and `pumpkin-ts-models` browser bundle diagnostics recorded in V2.8.61O.
