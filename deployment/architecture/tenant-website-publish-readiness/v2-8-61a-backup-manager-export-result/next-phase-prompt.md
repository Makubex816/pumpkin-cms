# Next Phase Prompt

Approve V2.8.61B Airstrip Backup Restore Dry-Run Planning only.

Use V2.8.61A as carryforward. The protected backup bundle exists at:

`C:\Users\User\Desktop\PumpkinCMS\secure-operator-handoff\tenant-backups\v2-8-61a-airstrip-full-backup-proof`

Required boundaries:

- Read the V2.8.61A protected backup bundle as input.
- Validate `checksums.sha256` before using any bundle file.
- Run local restore dry-run/planning only.
- Do not mutate live tenants, users, pages, media, forms, themes, DomainBinding records, appsettings, DNS/custom domains, indexing, storage, or Azure resources.
- Do not deploy Pumpkin API, Admin UI, or Airstrip.
- Do not submit forms or contact POSTs.
- Do not upload/delete media.
- Do not use storage keys, listKeys, SAS, connection strings, Key Vault reads, or protected config unless a new explicit secure handoff approves it.
- Produce restore dry-run evidence, restore dependency order, recoverability matrix, nonrecoverable item register, and exact next live-restore approval packet.

Required output:

- V2.8.61B root report.
- V2.8.61B result package.
- Local restore dry-run validation summary.
- No-live-mutation security boundary result.
