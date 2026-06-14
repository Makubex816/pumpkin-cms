# Fixture Coverage Summary

Valid fixtures:

- `valid-ice-carryforward.import-package.json`: active proof tenant carryforward, production published, no import execution.
- `valid-roller-paused.import-package.json`: paused Roller candidate, no import/resume.

Invalid fixtures:

- `invalid-missing-tenant-key.import-package.json`
- `invalid-missing-owner-approval.import-package.json`
- `invalid-missing-backup-proof.import-package.json`
- `invalid-production-mutation-requested.import-package.json`
- `invalid-protected-config-reference.import-package.json`
- `invalid-secret-like-value.import-package.json`
- `invalid-paused-tenant-resume-without-approval.import-package.json`

Coverage result:

- 2 valid fixtures passed.
- 7 invalid fixtures failed.
- Total fixtures: 9.
