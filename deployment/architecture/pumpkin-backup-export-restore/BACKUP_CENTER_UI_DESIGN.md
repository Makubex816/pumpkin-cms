# Backup Center UI Design

## Screens

| Screen | Purpose |
| --- | --- |
| Backup dashboard | show recent jobs, health, retention, blocked gates, and warnings |
| Create standard backup | choose tenant/platform scope and non-secret backup mode |
| Create recovery escrow backup | elevated flow for encrypted selected secrets |
| Backup job status | show progress, validation, warnings, artifact availability |
| Download backup | controlled download with checksum and expiration |
| Validate backup | upload/select artifact and run validation |
| Restore dry-run | generate restore plan for sandbox/local target |
| Escrow restore request | separate approval request to decrypt/restore selected categories |
| Audit log | searchable job/download/approval/restore events |
| Retention/cleanup view | list expiring artifacts and cleanup outcomes |

## Low-Skill Warnings

The UI should use plain language:

- "Standard backups do not include passwords, API keys, or tokens."
- "Recovery escrow can include encrypted selected secrets. Use it only for recovery planning."
- "Creating escrow does not restore secrets."
- "Restoring must be validated in a sandbox before production."
- "Do not download backup files to shared or public folders."

## Hard Stops

The UI must block:

- secret inclusion in standard backups;
- escrow without approval;
- escrow restore without separate approval;
- public/static output paths;
- support-packet export with escrow included;
- restore into production without restore validation and approval.
