# Database Artifact Security Rules

Database exports are sensitive even when no secret values are intentionally exported.

## Required Rules

- Database artifacts must never be staged into Git.
- Database artifacts must be written only under ignored `.tmp` output or approved private backup storage.
- Portable database artifacts must be encrypted before long-term storage or transfer.
- Checksums must be generated before and after any copy/move step.
- Artifact names must avoid secret values and internal credentials.
- Reports may include artifact filenames, sizes, checksum values, and redacted storage location labels only.
- Retention and cleanup rules must be recorded before execution.
- Restore validation must run before declaring production restore proof.

## Prohibited

- Protected config reads.
- Connection strings in command logs or manifests.
- Storage keys or SAS URLs in standard backup files.
- Uploading database exports to public or repo-visible locations.
- Committing `.bacpac`, `.bak`, `.sql`, `.zip`, `.7z`, `.enc`, or equivalent database artifacts.
- Restoring into production during backup validation.

## Recommended Local Output Pattern

```text
deployment/architecture/pumpkin-backup-export-restore/backup-implementation/.tmp/ice-database-media-completion/
  database/
    DATABASE_ARTIFACT_NOT_STAGED.md
    ice-database-export.{approved-extension}
    ice-database-export.{approved-extension}.sha256
```

The exact artifact extension depends on the later approved export/encryption mode.

