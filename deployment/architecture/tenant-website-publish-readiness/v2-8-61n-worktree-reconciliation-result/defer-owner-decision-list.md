# Defer / Owner Decision List

Status: owner decision required.

Defer before staging:

- All source changes under `apps/admin`, `apps/pumpkin-api`, `apps/pumpkin-api.Tests`, and `apps/ice-rink-web`.
- `deployment/architecture/multi-tenant-onboarding/import-package-governance-implementation/src/*`.
- `deployment/architecture/multi-tenant-onboarding/import-package-governance-implementation/test/*`.
- `packages/pumpkin-ts-models/dist/*`.
- Root and deployment reports with `SECURE`, `HARDCOPY`, `security-redaction`, `no-secret`, or similar names until confirmed report-safe.
- Airstrip DNS/domain runtime docs, because Airstrip is frozen and these should be reviewed as historical decision records before staging.
- `content-review/*` paths, because they are tenant package/media artifacts.
- `test-results/*`, because they are proof/browser artifacts.

Owner decisions needed:

- Which report batches are desired in git history.
- Whether package dist files are intentionally source-controlled outputs.
- Whether content-review artifacts should be archived outside the repo or deleted.
- Whether `content-review/` and `test-results/` should be added to `.gitignore`.
- Whether source changes should be reviewed and committed by feature area.
