# Tenant Pause Resume Governance

Paused tenants cannot move unless a future approval explicitly resumes them.

Rules:

- `roller-rink-rentals` remains paused.
- `resumeApproved: false` must block any `resume_requested` package.
- A paused/no-import package may exist only as a governance record.
- No CMS/provider writes, route checks, deployment, DNS, indexing, or contact POST can occur for a paused tenant.

Validator result:

- `valid-roller-paused.import-package.json` passes because it is `paused_no_import`.
- `invalid-paused-tenant-resume-without-approval.import-package.json` fails because it requests resume without approval.
