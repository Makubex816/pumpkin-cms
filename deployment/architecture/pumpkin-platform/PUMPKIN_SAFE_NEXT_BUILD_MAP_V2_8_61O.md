# Pumpkin Safe Next Build Map V2.8.61O

Status: recommendation only.

## Immediate Safe Next Phase

Approve V2.8.61P New Tenant Intake Values Review and Package Analyzer Preflight only after the owner completes `.tmp/v2-8-61o/owner-input/new-tenant-intake-owner-values.json`.

Allowed in that phase:

- Read the completed ignored owner-values template.
- Verify package path exists.
- Run package analyzer only if the package path is provided and analysis-only approval is explicit.
- Produce owner action packet or analyzer proof.

Still not approved:

- Tenant creation.
- Media upload.
- Record import.
- Deploy or preview deploy.
- DNS/custom-domain mutation.
- Contact POST, form submission, or customer-facing POST proof.
- Airstrip probing or mutation.
- Worktree cleanup execution.

## Parallel Optional Phase

Approve TenantAdmin Auth Boundary GET-Only Proof only if approved TenantAdmin credentials are available through a secure ignored path.

Do not combine TenantAdmin proof with new tenant creation or Airstrip proof.
