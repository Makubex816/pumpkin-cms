# Current State Summary

Phase: V2.8.54F

Status: validation_passed_resource_rationalization_no_mutation

| metric | value |
| --- | --- |
| Accessible subscriptions | 1 |
| Resource groups | 8 |
| All resources | 27 |
| Pumpkin/Ice related resources | 26 |
| Active production do-not-delete | 6 |
| Isolated/staging do-not-delete | 2 |
| Observability/backup do-not-delete | 8 |
| Legacy deferred | 3 |
| Redundant candidates needing proof | 7 |
| Runtime GET checks passed | 14/14 after bounded GET-only recheck |

Comparison carryforward:

| file | exists | bytes | carryforward |
| --- | --- | --- | --- |
| deployment/architecture/pumpkin-platform/PUMPKIN_LIVE_RESOURCE_REGISTRY_V2_8_46A.md | true | 3984 | Live registry says primary production, isolated, observability are do-not-touch; legacy endpoint deferred. |
| deployment/architecture/pumpkin-platform/PUMPKIN_FULL_PLATFORM_AUDIT_V2_8_52.md | true | 1034 | Full audit confirms Ice live and partner creation paused. |
| deployment/architecture/pumpkin-platform/PUMPKIN_TENANT_BACKUP_COVERAGE_MATRIX_V2_8_52A.md | true | 1366 | Backup matrix confirms Ice data/media backup coverage and restore gaps. |
| deployment/architecture/pumpkin-platform/PUMPKIN_EXTERNAL_INTEGRATION_BUILD_MAP_V2_8_53R.md | true | 1393 | External integration build map keeps secondary creation paused pending compatibility. |
| deployment/architecture/pumpkin-platform/PUMPKIN_SECONDARY_TENANT_COMPATIBILITY_PRECONDITIONS_V2_8_53S.md | true | 856 | Compatibility preconditions keep tenant creation paused except route compatibility cleared. |
| deployment/architecture/pumpkin-platform/PUMPKIN_ADMIN_UI_FEATURE_COVERAGE_V2_8_54A.md | true | 4104 | Admin UI feature coverage is source-present/read-only proven; writes need approval. |
| deployment/architecture/pumpkin-platform/PUMPKIN_PARTNER_TENANT_REPO_READINESS_V2_8_54D.md | true | 641 | V2.8.54D says partner live creation is not ready because worktree owner decisions remain. |
