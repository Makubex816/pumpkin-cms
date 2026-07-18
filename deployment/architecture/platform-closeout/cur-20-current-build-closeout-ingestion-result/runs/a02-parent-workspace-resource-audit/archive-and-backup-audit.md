# Archive and backup audit

Archive census covered `.zip`, `.7z`, `.tar`, `.tgz`, `.tar.gz`, `.gz`, and `.rar` names under the parent workspace. ZIP central directories were inspected where possible; non-ZIP archive-like files were hashed and classified by metadata. No archive script was executed and no archive was extracted into the repository.

## Archive totals

| Top-level area | Archives | Bytes |
| --- | ---: | ---: |
| `pumpkin-cms` | 88 | 497,231,174 |
| `secure-operator-handoff` | 29 | 220,647,611 |
| `tenant-onboarding-intake` | 6 | 374,244,819 |
| `ice-site-recovery-intake` | 6 | 37,534,918 |
| `content-review` | 3 | 62,562,819 |
| `backup-inspection` | 1 | 109,488 |
| `jsons` | 1 | 20,886 |
| Total | 134 | 1,192,351,715 |

## Integrity and Atlas signatures

- Corrupt/unreadable archives observed: 0.
- Archive central-directory Atlas candidates: 0.
- Archive central-directory working-memory candidates: 0.
- No archive entry matched `.project-ops`, `atlas/milestone-ledger.json`, `attempt-ledger.ndjson`, `CURRENT-STATE`, `CURRENT-PHASE`, `EVIDENCE-INDEX`, `RESUMPTION-CAPSULE`, or `CHAT-PACK`.

## Largest archive records

| Relative path | Bytes | SHA-256 | Classification |
| --- | ---: | --- | --- |
| `tenant-onboarding-intake/PartyPros/source-upload/pp_next_pumpkin_ready_2026-07-08 1.zip` | 114,102,368 | `158fbbdc12664ec258d75a021bfe198ce4169e35bfc9bccdea2e6a5bb810e5f8` | tenant intake/source |
| `tenant-onboarding-intake/PartyPros/visual-reference/Philadelphia Party Rentals DEPLOY_READY_2026-07-08 (2).zip` | 100,009,111 | `55677620a7b97e9a3801ef8b42b7bae3dde59afc045f27b007ebd8c362b15051` | tenant visual reference |
| `tenant-onboarding-intake/7-10-2026 new tentant/stripclubnearmevegas-final-menu-restored (2).zip` | 79,974,507 | `c1612b09fa9d0e2629382957a8f943c7f43256e17b25bbb6b89eaf116e43c0f4` | tenant intake/source |
| `tenant-onboarding-intake/secondary-candidate/stripclubnearmevegas-final-menu-restored.zip` | 38,029,880 | `1c2a5828641b0c472b34bc1913b9f8aba50756f5203b47f73fb9acd4d6225c4a` | secondary tenant candidate |
| `tenant-onboarding-intake/secondary-candidate/Previoustentantupload.zip` | 37,994,903 | `88b17a2a65a52ec15fc6a65f32b0de8c879e487f93028c2fc93b080c71367fbe` | historical tenant source |
| `pumpkin-cms/apps/starter-app/.next/cache/webpack/client-development/1.pack.gz` | 29,058,524 | `e0600f1b4a0b837e0b18f4e4ec79d951ecea5081491c0549478126f9ca6ee88f` | generated cache |
| `pumpkin-cms/deployment/architecture/pumpkin-backup-export-restore/backup-implementation/.tmp/phase-2f13-unified-backup-generator/ice-download-recheck/ice-rink-rentals-standard-backup-2026-06-10-030414459Z.zip` | 23,329,756 | `8fea85b83fd3dbc5e27574edb0f9acd68d7ac2f3bdcf499c4c27cec5c236fa28` | Ice backup |
| `content-review/ice-approved-homepage-conversion/ice-site-contact-email-correction-pack.zip` | 22,038,780 | `1f56c9f01b9fc31013ad1fa929b6eaf5a1648e1510b4dbee73aef297062419b3` | content review |
| `ice-site-recovery-intake/media-binaries/ice-site-phase10a-pumpkin-ppec-rewrite-pack.zip` | 19,753,134 | `d5a3988ccb31f7843d5de93f5dbbdbaa99a42bbdb9c5ba3d8c5b61ffe9729d2e` | recovery media |
| `pumpkin-cms/.tmp/v2-8-63crstu/artifacts/api-87ba5cd0/candidate-a.zip` | 12,045,875 | `0cdd1dea1ff7a39d2484a7e3b36f1a0b2f76501f714732ba47c1c18452b0e7d4` | CRSTU API candidate |
| `pumpkin-cms/.tmp/v2-8-63crstu/artifacts/api-87ba5cd0/candidate-b.zip` | 12,045,875 | `0cdd1dea1ff7a39d2484a7e3b36f1a0b2f76501f714732ba47c1c18452b0e7d4` | duplicate CRSTU API candidate |

## Backup classification

- Platform backups and tenant backups are valid current/historical backup evidence.
- CRSTU API candidate packages are rollback/deployment artifacts, not Atlas packages.
- Tenant onboarding archives are customer/private content inputs.
- No backup or owner handoff archive was promoted to active Atlas because no Atlas structural signature was found in archive metadata.
