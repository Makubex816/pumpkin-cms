# Next Phase Prompt

Approve V2.11.7 Scoped Ice Import Execution Approval Gate only if a V2.11.6-compatible approval manifest is supplied with `executionApprovalGranted: true`, `operatorApproval.approved: true`, package ID `ice-rink-rentals-carryforward-v2-11-2`, package hash `sha256:b0fdd67d5d31e798bf1a9ae3e5f576c17129030cd816e3a8b726b0767002d073`, tenant key `ice-rink-rentals`, site key `ice-rink-rentals`, no-go conditions cleared, Backup Center / Resource Registry / Provider Profile / Runtime QA / OLM / Audit Jobs / rollback / readback / audit trace bindings present, and an exact write command boundary named. If any required value is missing or mismatched, stop before execution and create a blocked result package.

Approved only after those values are present:

- Re-run package hash verification.
- Re-run no-go/prerequisite validation.
- Re-run no-write dry-run.
- Run pre-write readback if approved and safe.
- Execute at most one scoped Ice import write only if the manifest and explicit user approval both permit it.
- Run immediate readback and audit trace capture if approved.
- Stop before any deployment, DNS/custom-domain, Google/Search Console/indexing, contact POST, Azure mutation, Roller resume, live tenant creation, broad retry, or unrelated provider/CMS write.

Not approved by default:

- RollerRinkRentals.com resume.
- Roller import.
- Live tenant creation.
- Deployment/redeployment.
- DNS/custom-domain mutation.
- Google/Search Console/indexing.
- Contact-form submission or contact endpoint POST.
- Azure infrastructure/config mutation.
- RBAC assignment.
- Protected config reads.
- Token/key/listKeys/connection-string/SAS access.
- Electron runtime.
- Compressed archives in the repo.
- `git add -A`.

