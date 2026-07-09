# Next Phase Prompt

Approve V2.8.61OG Party Pros Backup Restore Dry-Run Readiness Verification.

Scope:

- Use the completed V2.8.61OF outside backup bundle at `C:\Users\User\Desktop\PumpkinCMS\secure-operator-handoff\tenant-backups\v2-8-61of-party-pros-full-backup-proof`.
- Parse and verify `manifest.json`, `tenant-summary.json`, `checksums.sha256`, `validation/backup-validation-report.json`, `restore/RESTORE_RUNBOOK.md`, and `MISSING_OR_NONRECOVERABLE_ITEMS.md`.
- Run a no-mutation restore dry-run against local/in-memory validation only.
- Prove dependency order for Tenant, Theme, Pages, FormDefinition, MediaAsset metadata, ImportRun, PublishRun, DomainBinding, sanitized Users, and FormEntry if present.
- Verify media restore planning from `media/blobs/` and shared media mapping only.
- Produce repo-safe restore dry-run docs with paths, counts, and hashes.

Still not approved:

- No live restore.
- No tenant/content/media/user/role/DomainBinding mutation.
- No deploy.
- No DNS/custom-domain action.
- No contact POST.
- No form submission.
- No customer-facing POST proof.
- No Airstrip probe/action.
- No storage keys/listKeys/SAS.
- No appsetting mutation.
- No Azure resource creation.
- No backup bundle, hardcopy, secure file, uploaded ZIP, media payload, or package output staging.
- No `git add -A`.
