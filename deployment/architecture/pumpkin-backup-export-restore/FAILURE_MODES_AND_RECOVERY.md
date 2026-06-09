# Failure Modes And Recovery

| Failure | Recovery |
| --- | --- |
| Manifest schema invalid | fail validation; block restore planning |
| Checksum mismatch | quarantine artifact; block download/restore |
| Secret detected in standard backup | fail closed; delete artifact if created; rotate if exposure occurred |
| Protected config path detected | fail closed; investigate source selection |
| Escrow recipient key expired | block escrow creation or restore |
| Escrow encryption failure | fail closed; no plaintext artifact persisted |
| Worker crash | cleanup temp workspace; mark job failed; allow bounded retry if safe |
| Database export inconsistency | mark backup invalid for restore; rerun under approved consistent mode |
| Media copy incomplete | mark backup warning/fail depending scope; block restore until resolved |
| Restore readback mismatch | stop restore flow; use rollback plan and owner review |
| Artifact retention cleanup fails | keep artifact blocked from download and alert operator |

## Recovery Principle

Failures should prefer blocked/failed status over partially trusted artifacts. Backup Center must make uncertainty visible before any write, restore, or deployment gate proceeds.
