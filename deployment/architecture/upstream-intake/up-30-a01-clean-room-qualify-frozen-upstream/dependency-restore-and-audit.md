
# Dependency restore and audit

Trusted locked graph complete: `false`

Key findings:

- Exact .NET SDK 10.0.100 was not available from the host SDK resolver and was installed locally under the UP-30 outside-repository tools directory for qualification.
- No committed .NET packages.lock.json files were present; exact-SDK locked-mode restore/build/test passed, but NuGet transitive lockfile evidence remains absent.
- The repository root contains a package-lock.json but no root package.json, so root-level npm ci cannot qualify a workspace dependency graph.
- pumpkin-ts-models npm ci and build passed in both clean-room roots, but npm audit reported high-severity dev-dependency advisories for brace-expansion and minimatch.
- pumpkin-block-views has no adjacent package-lock.json; npm ci fails and build cannot resolve tsc under locked restore.
- apps/starter-app has no adjacent package-lock.json; npm ci fails and type-check/build cannot resolve tsc under locked restore.
- npm audit could not be completed for block-views or starter-app because lockfiles are absent.
- No upstream GitHub Actions workflow was present in the frozen source to use as an authoritative CI mirror.
- The local exact-SDK first-run emitted a development certificate installation message; no trust command, live service activation, or deployment was performed.

.NET exact-SDK restore commands:

| Command | Result | Exit | Duration ms | Log |
|---|---:|---:|---:|---|
| run1 dotnet exact version | pass | 0 | 131 | `program-management/upstream-intake/UP-30-A01/logs/44_run1_dotnet_exact_version.log` |
| run1 dotnet exact restore locked | pass | 0 | 8871 | `program-management/upstream-intake/UP-30-A01/logs/45_run1_dotnet_exact_restore_locked.log` |
| run1 dotnet exact restore | pass | 0 | 1492 | `program-management/upstream-intake/UP-30-A01/logs/46_run1_dotnet_exact_restore.log` |
| run2 dotnet exact version | pass | 0 | 140 | `program-management/upstream-intake/UP-30-A01/logs/49_run2_dotnet_exact_version.log` |
| run2 dotnet exact restore locked | pass | 0 | 1071 | `program-management/upstream-intake/UP-30-A01/logs/50_run2_dotnet_exact_restore_locked.log` |
| run2 dotnet exact restore | pass | 0 | 1037 | `program-management/upstream-intake/UP-30-A01/logs/51_run2_dotnet_exact_restore.log` |

Actual npm restore and audit commands:

| Command | Result | Exit | Duration ms | Log |
|---|---:|---:|---:|---|
| npm actual version | pass | 0 | 238 | `program-management/upstream-intake/UP-30-A01/logs/56_npm_actual_version.log` |
| run1 npm actual ci root locked | fail | 4294963238 | 1229 | `program-management/upstream-intake/UP-30-A01/logs/57_run1_npm_actual_ci_root_locked.log` |
| run1 npm actual ci packages/pumpkin-ts-models | pass | 0 | 1662 | `program-management/upstream-intake/UP-30-A01/logs/58_run1_npm_actual_ci_packages_pumpkin-ts-models.log` |
| run1 npm actual ci packages/pumpkin-block-views | fail | 1 | 510 | `program-management/upstream-intake/UP-30-A01/logs/59_run1_npm_actual_ci_packages_pumpkin-block-views.log` |
| run1 npm actual ci apps/starter-app | fail | 1 | 477 | `program-management/upstream-intake/UP-30-A01/logs/60_run1_npm_actual_ci_apps_starter-app.log` |
| run1 npm actual audit root | pass | 0 | 483 | `program-management/upstream-intake/UP-30-A01/logs/61_run1_npm_actual_audit_root.log` |
| run1 npm actual audit packages/pumpkin-ts-models | fail | 1 | 995 | `program-management/upstream-intake/UP-30-A01/logs/77_run1_npm_actual_audit_packages_pumpkin-ts-models.log` |
| run1 npm actual audit packages/pumpkin-block-views | fail | 1 | 494 | `program-management/upstream-intake/UP-30-A01/logs/78_run1_npm_actual_audit_packages_pumpkin-block-views.log` |
| run1 npm actual audit starter | fail | 1 | 496 | `program-management/upstream-intake/UP-30-A01/logs/62_run1_npm_actual_audit_starter.log` |
| run2 npm actual ci root locked | fail | 4294963238 | 488 | `program-management/upstream-intake/UP-30-A01/logs/67_run2_npm_actual_ci_root_locked.log` |
| run2 npm actual ci packages/pumpkin-ts-models | pass | 0 | 1470 | `program-management/upstream-intake/UP-30-A01/logs/68_run2_npm_actual_ci_packages_pumpkin-ts-models.log` |
| run2 npm actual ci packages/pumpkin-block-views | fail | 1 | 497 | `program-management/upstream-intake/UP-30-A01/logs/69_run2_npm_actual_ci_packages_pumpkin-block-views.log` |
| run2 npm actual ci apps/starter-app | fail | 1 | 473 | `program-management/upstream-intake/UP-30-A01/logs/70_run2_npm_actual_ci_apps_starter-app.log` |
| run2 npm actual audit root | pass | 0 | 497 | `program-management/upstream-intake/UP-30-A01/logs/71_run2_npm_actual_audit_root.log` |
| run2 npm actual audit packages/pumpkin-ts-models | fail | 1 | 744 | `program-management/upstream-intake/UP-30-A01/logs/79_run2_npm_actual_audit_packages_pumpkin-ts-models.log` |
| run2 npm actual audit packages/pumpkin-block-views | fail | 1 | 521 | `program-management/upstream-intake/UP-30-A01/logs/80_run2_npm_actual_audit_packages_pumpkin-block-views.log` |
| run2 npm actual audit starter | fail | 1 | 505 | `program-management/upstream-intake/UP-30-A01/logs/72_run2_npm_actual_audit_starter.log` |

Audit summary for `packages/pumpkin-ts-models`:

- Total vulnerabilities: 2
- High: 2
- Critical: 0
- Findings: brace-expansion (high), minimatch (high)

Interpretation: exact-SDK .NET restore/build/test qualified after local toolchain correction. The Node package suite remains partially qualified only: `pumpkin-ts-models` has locked install/build evidence, while root, block-views, and starter-app cannot establish complete locked restore/audit evidence from the frozen source.
