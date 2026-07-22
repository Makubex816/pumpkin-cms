
# .NET build and test result

Disposition: `QUALIFIED_WITH_HOLDS`

Final exact-SDK results:

- Exact SDK 10.0.100 command selection passed: true
- Exact-SDK locked restore passed in both runs: true
- Exact-SDK diagnostic restore passed in both runs: true
- Exact-SDK Release build passed in both runs: true
- Exact-SDK test command passed in both runs: true

Exact-SDK commands:

| Command | Result | Exit | Duration ms | Log |
|---|---:|---:|---:|---|
| run1 dotnet exact version | pass | 0 | 131 | `program-management/upstream-intake/UP-30-A01/logs/44_run1_dotnet_exact_version.log` |
| run1 dotnet exact restore locked | pass | 0 | 8871 | `program-management/upstream-intake/UP-30-A01/logs/45_run1_dotnet_exact_restore_locked.log` |
| run1 dotnet exact restore | pass | 0 | 1492 | `program-management/upstream-intake/UP-30-A01/logs/46_run1_dotnet_exact_restore.log` |
| run1 dotnet exact build release | pass | 0 | 8107 | `program-management/upstream-intake/UP-30-A01/logs/47_run1_dotnet_exact_build_release.log` |
| run1 dotnet exact test release | pass | 0 | 558 | `program-management/upstream-intake/UP-30-A01/logs/48_run1_dotnet_exact_test_release.log` |
| run2 dotnet exact version | pass | 0 | 140 | `program-management/upstream-intake/UP-30-A01/logs/49_run2_dotnet_exact_version.log` |
| run2 dotnet exact restore locked | pass | 0 | 1071 | `program-management/upstream-intake/UP-30-A01/logs/50_run2_dotnet_exact_restore_locked.log` |
| run2 dotnet exact restore | pass | 0 | 1037 | `program-management/upstream-intake/UP-30-A01/logs/51_run2_dotnet_exact_restore.log` |
| run2 dotnet exact build release | pass | 0 | 3641 | `program-management/upstream-intake/UP-30-A01/logs/52_run2_dotnet_exact_build_release.log` |
| run2 dotnet exact test release | pass | 0 | 550 | `program-management/upstream-intake/UP-30-A01/logs/53_run2_dotnet_exact_test_release.log` |

Hold: no committed `packages.lock.json` files were present, so NuGet transitive lockfile evidence remains absent even though `dotnet restore --locked-mode` exited successfully under the exact SDK.
