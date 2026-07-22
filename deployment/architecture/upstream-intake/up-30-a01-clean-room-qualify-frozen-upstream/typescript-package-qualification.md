
# TypeScript package qualification

Disposition: `QUALIFIED_WITH_HOLDS`

Results:

- `pumpkin-ts-models` npm ci passed in both roots: true
- `pumpkin-ts-models` build passed in both roots: true
- `pumpkin-block-views` npm ci passed in both roots: false
- `pumpkin-block-views` build passed in both roots: false

Commands:

| Command | Result | Exit | Duration ms | Log |
|---|---:|---:|---:|---|
| run1 npm actual ci packages/pumpkin-ts-models | pass | 0 | 1662 | `program-management/upstream-intake/UP-30-A01/logs/58_run1_npm_actual_ci_packages_pumpkin-ts-models.log` |
| run1 npm actual ci packages/pumpkin-block-views | fail | 1 | 510 | `program-management/upstream-intake/UP-30-A01/logs/59_run1_npm_actual_ci_packages_pumpkin-block-views.log` |
| run1 npm actual audit packages/pumpkin-ts-models | fail | 1 | 995 | `program-management/upstream-intake/UP-30-A01/logs/77_run1_npm_actual_audit_packages_pumpkin-ts-models.log` |
| run1 npm actual audit packages/pumpkin-block-views | fail | 1 | 494 | `program-management/upstream-intake/UP-30-A01/logs/78_run1_npm_actual_audit_packages_pumpkin-block-views.log` |
| run2 npm actual ci packages/pumpkin-ts-models | pass | 0 | 1470 | `program-management/upstream-intake/UP-30-A01/logs/68_run2_npm_actual_ci_packages_pumpkin-ts-models.log` |
| run2 npm actual ci packages/pumpkin-block-views | fail | 1 | 497 | `program-management/upstream-intake/UP-30-A01/logs/69_run2_npm_actual_ci_packages_pumpkin-block-views.log` |
| run2 npm actual audit packages/pumpkin-ts-models | fail | 1 | 744 | `program-management/upstream-intake/UP-30-A01/logs/79_run2_npm_actual_audit_packages_pumpkin-ts-models.log` |
| run2 npm actual audit packages/pumpkin-block-views | fail | 1 | 521 | `program-management/upstream-intake/UP-30-A01/logs/80_run2_npm_actual_audit_packages_pumpkin-block-views.log` |
| run1 ts models actual build | pass | 0 | 1128 | `program-management/upstream-intake/UP-30-A01/logs/63_run1_ts_models_actual_build.log` |
| run1 block views actual build | fail | 1 | 300 | `program-management/upstream-intake/UP-30-A01/logs/64_run1_block_views_actual_build.log` |
| run2 ts models actual build | pass | 0 | 1072 | `program-management/upstream-intake/UP-30-A01/logs/73_run2_ts_models_actual_build.log` |
| run2 block views actual build | fail | 1 | 302 | `program-management/upstream-intake/UP-30-A01/logs/74_run2_block_views_actual_build.log` |

Primary holds:

- `pumpkin-block-views` has no adjacent package lockfile; `npm ci` fails with npm EUSAGE.
- Its build cannot resolve `tsc` under locked restore.
- `pumpkin-ts-models` builds successfully but its npm audit reports high-severity dev-dependency advisories.
