# Output Storage And Retention Plan

## Local Output

Use ignored local output for first completion validation:

```text
deployment/architecture/pumpkin-backup-export-restore/backup-implementation/.tmp/ice-database-media-completion/
```

Required:

- confirm the output path is ignored by Git;
- refuse paths outside the Backup Center `.tmp` tree unless explicitly approved;
- refuse overlap with source bundle paths;
- write manifest/checksum/report files;
- do not stage generated artifacts.

## Private Backup Storage

Use private backup storage only with explicit approval.

Required:

- private container/bucket;
- least-privilege source/destination access;
- retention class;
- encryption at rest;
- checksum proof;
- access log/audit evidence if available;
- no public access.

## Retention

Recommended retention for the first completion validation:

- local temporary artifacts: remove or archive after owner review;
- private backup artifacts: retain under approved retention class;
- reports and manifests: keep in Git only if they contain no secrets and no generated binary artifacts.

## Cleanup Rule

Cleanup must be an explicit later approval if it deletes artifacts. Phase 2F-9 does not delete files.

