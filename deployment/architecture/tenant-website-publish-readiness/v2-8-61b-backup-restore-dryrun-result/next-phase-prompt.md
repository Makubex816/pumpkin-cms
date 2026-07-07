# Next Phase Prompt

Approve V2.8.61C Backup Manager Live Restore Adapter Contract and Read-Only Admin Intake Design only.

Use V2.8.61B as carryforward. The Airstrip backup restore dry-run passed with documented gaps. The dry-run proof exists at:

`C:\Users\User\Desktop\PumpkinCMS\secure-operator-handoff\tenant-backups\v2-8-61b-airstrip-restore-dryrun-proof`

Scope:

- Design live restore adapter contracts.
- Design target tenant selection and safety gates.
- Design restore audit/BackupRun model.
- Design sanitized identity restore and password reset workflow.
- Design media restore policy without storage keys/listKeys/SAS unless separately approved.
- Design DomainBinding pending/non-live restore semantics.
- Design Admin UI Backup Manager read-only intake.
- Produce implementation map and test plan.

Hard boundaries:

- No live restore.
- No tenant creation.
- No database, media, content, identity, DomainBinding, appsetting, DNS, custom-domain, indexing, deploy, form/contact POST, or customer-facing POST mutation.
- No Key Vault secret reads.
- No storage keys/listKeys/SAS or connection string generation.
- Do not stage backup bundles, restore dry-run artifacts, `.tmp`, protected config, or generated deployment artifacts.
- Do not use `git add -A`.
