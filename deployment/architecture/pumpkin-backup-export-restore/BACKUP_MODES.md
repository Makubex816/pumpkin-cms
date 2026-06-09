# Backup Modes

## Mode Matrix

| Mode | Scope | Includes secrets | Primary use | Approval |
| --- | --- | --- | --- | --- |
| Tenant standard backup | one tenant/site | no | routine pre-write and support recovery | backup creator |
| Full platform standard backup | all tenants/platform metadata | no | platform release safety checkpoint | operator plus backup creator |
| Tenant recovery backup with encrypted escrow | one tenant/site plus encrypted selected secrets | encrypted allowlist only | disaster recovery | escrow requester plus escrow approver |
| Full platform recovery backup with encrypted escrow | all platform state plus encrypted selected secrets | encrypted allowlist only | platform disaster recovery | multi-party elevated approval recommended |
| Content-only backup | CMS content records | no | content diff, offline review | backup creator |
| Media-only backup | MediaAsset metadata and blob-copy manifest | no by default | media migration/relink planning | backup creator |
| Database-only backup | database portable export | no standard secrets; artifact is sensitive | low-level recovery | operator approval |
| Offline editing package | editable tenant content package | no | human review and offline changes | operator |
| Pre-write safety backup | targeted before-state | no | required before CMS writes | write preflight gate |
| Pre-deployment safety backup | release evidence and rollback context | no | deployment readiness | deployment gate |

## Standard Backup Rule

Standard backups exclude secret values. They may include env/config names with `PRESENT`, `MISSING`, `REDACTED`, or `NOT_APPLICABLE`, but never values.

## Recovery Escrow Rule

Recovery escrow backups can include encrypted selected secrets only when:

- recovery escrow mode is explicitly selected;
- secret categories are allowlisted;
- short-lived and personal credentials are excluded;
- an elevated approval record exists;
- recipient public keys are selected;
- plaintext is never written to public/static directories;
- logs contain only metadata and checksums.

## Restore Separation

Backup creation does not restore anything. Escrow creation does not restore secrets. Any restore or escrow restore requires a separate approval and a separate restore validation workflow.
