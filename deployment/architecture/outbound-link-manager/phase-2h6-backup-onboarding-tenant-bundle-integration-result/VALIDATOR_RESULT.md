# Validator Result

Implemented validators:

- `backup-center-export-validator.mjs`
- `tenant-bundle-validator.mjs`
- `onboarding-import-validator.mjs`
- `restore-validation-simulator.mjs`

Proof results:

| Validator | Status | Links | Instances | Render Decisions |
| --- | --- | ---: | ---: | ---: |
| Backup Center export | passed | 5 | 5 | 5 |
| Tenant bundle export | passed | 5 | 5 | 5 |
| Valid onboarding import | passed | 5 | 5 | n/a |
| Restore simulation | passed | 5 | 5 | 5 |

Expected gate failures:

- unreviewed-domain onboarding import failed as expected;
- blocked-domain onboarding import failed as expected.
