# Known Limitations

- Production records are local candidates only.
- No production provider implementation exists in this phase.
- No production database migration exists in this phase.
- Rollback package output is evidence, not executable live rollback tooling.
- Resource Registry update output is a candidate, not an applied update.
- Backup-before-migration output lists required evidence but does not create live backups.
- The schema contract validator is local JavaScript validation, not a generated JSON Schema package.
- Local tenant/role/provider guards remain simulations until future staging/live provider work is approved.

