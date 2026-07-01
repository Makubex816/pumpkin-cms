# Backup Gap Register

| Priority | Gap | Current Status | Required Next Action |
| --- | --- | --- | --- |
| P0 | Identity restore | Partial, redacted current actor only | Approve user reset/reseed or source-discovered identity export path. |
| P0 | Secret-like runtime/contact/API restore | Excluded by design | Provide ignored secure handoff for any restore phase. |
| P0 | Live restore adapter | Not approved/not executed | Design and approve target-scoped restore workflow. |
| P1 | FormEntry PII restore | Protected backup only | Require explicit target and privacy approval. |
| P1 | Static publish artifact replay | Metadata summary only | Either regenerate from CMS state or approve protected static artifact copy. |
| P2 | Production backup service | Not present | Promote local Backup Center concepts into an approved production service if needed. |
| P2 | App Service custom backups | Deferred by no-SAS/no-key policy | Revisit only if policy changes. |
