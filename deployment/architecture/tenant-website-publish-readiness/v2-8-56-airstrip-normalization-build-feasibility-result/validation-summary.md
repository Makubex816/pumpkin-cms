# Validation Summary

Final validation state:

| validation | result |
| --- | --- |
| Required result files exist | Passed |
| Root and durable docs exist | Passed |
| JSON parse for repo manifest and normalized package | Passed, 19 files |
| Changed JS/MJS check | Not applicable, none in V2.8.56 output |
| Extract/copy into ignored workspace | Passed |
| Source script inspection | Passed |
| Dependency install with scripts disabled | Passed |
| Isolated adapted source build | Passed |
| Static export adapter probe | Failed as expected on dynamic route |
| Normalized package generated outside repo | Passed |
| V2.8.50 package validator | Passed, 0 errors, 0 warnings |
| Package secret scan | Passed, 0 validator hits |
| Secret-value scan over reports/package | Passed, 0 hits |
| Command-shaped disallowed scan | Passed, 0 hits |
| Trailing whitespace scan | Passed, 0 hits |
| `git diff --check` | Passed; full worktree emitted only existing CRLF normalization warnings |
| Scoped `git diff --check` | Passed |
| Protected-path guard | Passed |
| `.tmp` ignore guard | Passed |
| Heavy `.tmp` extraction/build cleanup | Passed |
| Live mutation boundary | Passed |
| Staged files | None |

Cleanup state:

- `.tmp/v2-8-56/package-extract/` deleted.
- `.tmp/v2-8-56/source-build/` deleted.
- Ignored logs and validator summaries retained under `.tmp/v2-8-56/`.
- Normalized package retained outside repo at `C:\Users\User\Desktop\PumpkinCMS\tenant-onboarding-intake\TRUENewestTenant\airstrip-pumpkin-package-v1`.
