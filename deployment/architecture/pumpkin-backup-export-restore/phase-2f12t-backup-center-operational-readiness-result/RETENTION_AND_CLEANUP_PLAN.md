# Retention And Cleanup Plan

Status: ready for owner decision

Artifact classes:

| Artifact class | Example path | Retention stance |
| --- | --- | --- |
| 12T readiness docs | `deployment/architecture/pumpkin-backup-export-restore/phase-2f12t-backup-center-operational-readiness-result/` | Keep in Git. |
| Root 12T report | `PUMPKIN_BACKUP_EXPORT_RESTORE_PHASE_2F12T_OPERATIONAL_READINESS_REPORT.md` | Keep in Git. |
| Live Cosmos export proof | `backup-implementation/.tmp/phase-2f12r-live-cosmos-export/` | Keep locally only until owner archives or refreshes. |
| Media full-copy proof | `backup-implementation/.tmp/phase-2f12s-media-blob-copy/` | Keep locally only until owner archives or refreshes. |
| Complete standard backup candidate | `backup-implementation/.tmp/phase-2f12s-complete-ice-standard-backup/` | Treat as sensitive backup output; never stage. |
| Restore-plan proof | `backup-implementation/.tmp/phase-2f12s-restore-plan/` | Keep locally as validation evidence; never stage. |
| Resource Registry handoff | `resource-registry-implementation/.tmp/phase-2f12n-secure-handoff/` | Owner-controlled encrypted handoff only; never stage. |
| Encrypted vault | `resource-registry-implementation/.tmp/phase-2f12n-session-handoff-vault/` | Owner-controlled encrypted handoff only; never stage. |

Preservation guidance:

- Keep generated proof and handoff artifacts under ignored `.tmp` while they are actively needed.
- Before deleting any proof output, confirm the owner has accepted either the result docs alone or a separately retained encrypted copy.
- Do not put media blobs, Cosmos export JSON, vault payloads, handoff folders, or backup bundle folders into Git.
- Treat `.tmp` backups as sensitive operational data even when redacted or secret-free.

Cleanup guidance:

Use only explicit paths and only after owner approval. Preferred cleanup commands are path-specific PowerShell `Remove-Item -LiteralPath ... -Recurse -Force` commands against the approved `.tmp` subfolder. Do not use broad cleanup patterns.

Future refresh guidance:

- Rerun live Cosmos export only under a new explicit approval.
- Rerun live media download only under a new explicit approval.
- Refresh redacted registry/handoff before an operational handoff or credential rotation event.
- Recompute checksums after any approved refresh.
