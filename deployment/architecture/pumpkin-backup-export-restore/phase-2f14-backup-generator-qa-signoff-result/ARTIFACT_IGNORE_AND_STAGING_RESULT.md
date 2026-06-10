# Artifact Ignore And Staging Result

Checks performed:

```powershell
git status --short --ignored -- deployment/architecture/pumpkin-backup-export-restore/backup-implementation/.tmp/phase-2f14-backup-generator-qa
git diff --cached --name-only | rg -n "(^|/)\\.tmp/|\\.zip$|media/blobs|encrypted-vault|handoff-package|vault-payload|standard-backup-download"
git check-ignore -v <generated ZIP and media blob paths>
```

Result:

| Check | Result |
| --- | --- |
| `.tmp/phase-2f14-backup-generator-qa` ignored | yes |
| Fake ZIP ignored by package `.gitignore` | yes |
| Ice ZIP ignored by package `.gitignore` | yes |
| Ice media blob copy output ignored | yes |
| Generated `.tmp` artifacts staged | no |
| Generated ZIPs staged | no |
| Generated media copied output staged | no |
| Vault or handoff artifacts staged | no |

Start-state note:

The Git index already contained staged Phase 2F-13 source/result files. This pass did not stage or unstage them and did not stage generated artifacts.
