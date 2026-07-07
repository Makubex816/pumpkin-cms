# Pumpkin Backup Onboarding UI V2.8.61E

V2.8.61E adds SuperAdmin-only Admin UI workflow surfaces for backup and package onboarding.

Routes:

- `/dashboard/onboarding/backups`
- `/dashboard/onboarding/packages`

Behavior:

- SuperAdmin can review backup, restore dry-run, package analyzer, and compiler proof summaries.
- TenantAdmin cannot see the `Backups` or `Packages` nav links.
- TenantAdmin direct access to both routes returns `Access Restricted`.
- The browser UI is operator-assisted and read-only for these workflows.
- No browser control runs backup jobs, restore jobs, package uploads, package execution, tenant creation, DNS mutation, or indexing.

Deployment proof:

- Isolated Admin UI deploy: successful.
- Production Admin UI deploy: successful after isolated proof.
- Production browser proof: successful.
