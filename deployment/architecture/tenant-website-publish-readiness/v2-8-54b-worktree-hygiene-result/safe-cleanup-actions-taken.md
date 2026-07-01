# Safe Cleanup Actions Taken

Deleted 21 ignored generated-artifact directories after verifying each resolved path stayed inside the workspace. No source, report, protected config, content-review input, outside-repo path, or ordinary node_modules directory was deleted.

| path | before_path_count | artifact_type | recommended_bucket | action_taken | reason |
| --- | --- | --- | --- | --- | --- |
| .static-release-dry-runs | 972 | stale static publish dry-run output | delete_generated_safe | deleted | verified inside workspace before recursive delete |
| apps/ice-rink-web/.tmp/sanitized-static-build | 696827 | old sanitized static build copies with long paths | delete_generated_safe | deleted | verified inside workspace before recursive delete |
| apps/ice-rink-web/.tmp/v2-8-13-live-post-evidence | 0 | old app-local runtime evidence folder | delete_generated_safe | deleted | verified inside workspace before recursive delete |
| apps/ice-rink-web/.tmp/v2-8-22-isolated-swa-package | 0 | old isolated SWA package folder | delete_generated_safe | deleted | verified inside workspace before recursive delete |
| apps/ice-rink-web/.tmp/v2-8-23-isolated-swa-package | 0 | old isolated SWA package folder | delete_generated_safe | deleted | verified inside workspace before recursive delete |
| apps/ice-rink-web/.tmp/v2-8-23-isolated-swa-package-next-candidate | 0 | old isolated SWA candidate package folder | delete_generated_safe | deleted | verified inside workspace before recursive delete |
| apps/ice-rink-web/.tmp/v2-8-24-isolated-swa-package | 0 | old isolated SWA package folder | delete_generated_safe | deleted | verified inside workspace before recursive delete |
| apps/ice-rink-web/.tmp/v2-8-25-isolated-swa-package | 0 | old isolated SWA package folder | delete_generated_safe | deleted | verified inside workspace before recursive delete |
| apps/ice-rink-web/.tmp/v2-8-26-production-swa-package | 0 | old production SWA package folder | delete_generated_safe | deleted | verified inside workspace before recursive delete |
| apps/admin/.next | 2320 | generated Admin Next.js build output | delete_generated_safe | deleted | verified inside workspace before recursive delete |
| apps/ice-rink-web/.next | 178 | generated Ice Next.js build output | delete_generated_safe | deleted | verified inside workspace before recursive delete |
| apps/ice-rink-web/.static-artifacts | 42 | generated static artifacts | delete_generated_safe | deleted | verified inside workspace before recursive delete |
| .tmp/v2-8-45c/sanitized-static-build | 31075 | completed V2.8.45C sanitized static build copy | delete_generated_safe | deleted | verified inside workspace before recursive delete |
| .tmp/v2-8-45d/sanitized-static-build | 31075 | completed V2.8.45D sanitized static build copy | delete_generated_safe | deleted | verified inside workspace before recursive delete |
| .tmp/v2-8-45c/deploy-package | 55 | completed V2.8.45C deploy package output | delete_generated_safe | deleted | verified inside workspace before recursive delete |
| .tmp/v2-8-45d/deploy-package | 55 | completed V2.8.45D deploy package output | delete_generated_safe | deleted | verified inside workspace before recursive delete |
| .tmp/v2-8-49/admin-standalone | 1993 | completed V2.8.49 Admin standalone artifact | delete_generated_safe | deleted | verified inside workspace before recursive delete |
| .tmp/v2-8-42/browser-proof | 346 | completed V2.8.42 browser proof output | delete_generated_safe | deleted | verified inside workspace before recursive delete |
| .tmp/v2-8-33a/artifacts | 64 | completed V2.8.33A static-contact artifact output | delete_generated_safe | deleted | verified inside workspace before recursive delete |
| .tmp/v2-8-33b/artifacts | 54 | completed V2.8.33B static-contact artifact output | delete_generated_safe | deleted | verified inside workspace before recursive delete |
| .tmp/v2-8-44/runtime | 60 | completed V2.8.44 runtime evidence output | delete_generated_safe | deleted | verified inside workspace before recursive delete |

