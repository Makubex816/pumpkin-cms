
# Starter and admin build/test result

Disposition: `QUALIFIED_WITH_HOLDS`

Results:

- Starter locked restore passed: false
- Starter type-check passed: false
- Starter build passed: false

Commands:

| Command | Result | Exit | Duration ms | Log |
|---|---:|---:|---:|---|
| run1 npm actual ci apps/starter-app | fail | 1 | 477 | `program-management/upstream-intake/UP-30-A01/logs/60_run1_npm_actual_ci_apps_starter-app.log` |
| run1 npm actual audit starter | fail | 1 | 496 | `program-management/upstream-intake/UP-30-A01/logs/62_run1_npm_actual_audit_starter.log` |
| run2 npm actual ci apps/starter-app | fail | 1 | 473 | `program-management/upstream-intake/UP-30-A01/logs/70_run2_npm_actual_ci_apps_starter-app.log` |
| run2 npm actual audit starter | fail | 1 | 505 | `program-management/upstream-intake/UP-30-A01/logs/72_run2_npm_actual_audit_starter.log` |
| run1 starter actual type check | fail | 1 | 297 | `program-management/upstream-intake/UP-30-A01/logs/65_run1_starter_actual_type_check.log` |
| run1 starter actual build | fail | 1 | 293 | `program-management/upstream-intake/UP-30-A01/logs/66_run1_starter_actual_build.log` |
| run2 starter actual type check | fail | 1 | 293 | `program-management/upstream-intake/UP-30-A01/logs/75_run2_starter_actual_type_check.log` |
| run2 starter actual build | fail | 1 | 292 | `program-management/upstream-intake/UP-30-A01/logs/76_run2_starter_actual_build.log` |

Primary hold: `apps/starter-app` has no adjacent package lockfile; `npm ci` fails and both type-check/build fail because `tsc` is unavailable under locked restore.
