# Pumpkin Airstrip Restore Dry-Run Proof V2.8.61B

Status: passed with documented gaps.

Input bundle:

`C:\Users\User\Desktop\PumpkinCMS\secure-operator-handoff\tenant-backups\v2-8-61a-airstrip-full-backup-proof`

Dry-run output:

`C:\Users\User\Desktop\PumpkinCMS\secure-operator-handoff\tenant-backups\v2-8-61b-airstrip-restore-dryrun-proof`

Proof summary:

- Backup checksum entries validated: 61.
- Database restore counts validated: pages 5, media assets 13, themes 1, form definitions 1, domain bindings 1.
- Media files validated: 13.
- Website restore inputs validated.
- Restore order plan generated with 15 steps.
- Dry-run output checksum entries: 4.
- Runtime no-regression: 17/17 GET-only.

Documented bundle gap:

- Airstrip isolated preview host is not recorded in V2.8.61A resource metadata.
