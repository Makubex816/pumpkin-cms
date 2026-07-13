# API Deployment Package Verification

Both packages were built outside the repository under the user temp directory.

## Deployed Package

| Check | Result |
| --- | --- |
| File | `pumpkin-api-v2-8-62drt-posix.zip` |
| SHA-256 | `4B7FAE59FD03E5F3047E05C45CE6BEB220200A6A2F50913E87DEF422457992E0` |
| Bytes | 11,842,065 |
| ZIP entries | 56 |
| Backslash / absolute / duplicate entries | 0 / 0 / 0 |
| `appsettings*.json` | 0 |
| Protected / `.tmp` / nested ZIP entries | 0 / 0 / 0 |

This package deployed successfully but contains the Linux internal-path classification defect discovered by live validation.

## Corrected Package, Not Deployed

| Check | Result |
| --- | --- |
| File | `pumpkin-api-v2-8-62drt-corrected-not-deployed-posix.zip` |
| SHA-256 | `86E1E804DAA0204599C94F07371CBE95B3C34B13128DF11BB6DD317ED0286A3D` |
| Bytes | 11,842,252 |
| ZIP entries | 56 |
| Backslash / absolute / duplicate entries | 0 / 0 / 0 |
| `appsettings*.json` | 0 |
| Protected / `.tmp` entries | 0 / 0 |

Neither ZIP is in the repo or Git staging. The corrected ZIP is evidence only; a future phase should rebuild from the committed source rather than assume a temp artifact remains available.
