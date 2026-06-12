# Canonical Artifact Input List

| Artifact | Path | Status |
| --- | --- | --- |
| V2.8.3 root report | `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_3_ICE_LOCAL_SIGNOFF_REPORT.md` | canonical input |
| V2.8.3 result package | `deployment/architecture/tenant-website-publish-readiness/v2-8-3-ice-local-publish-readiness-signoff-result/` | canonical input |
| V2.8.3 manifest | `deployment/architecture/tenant-website-publish-readiness/v2-8-3-ice-local-publish-readiness-signoff-result/result-manifest.json` | canonical input |
| Ice seed source | `tools/ice-rink-local-seed/seed-sites/ice-rink-rentals/` | local source input |
| Ice web source | `apps/ice-rink-web/` safe source only | app source input |
| Runtime QA harness | `deployment/architecture/runtime-qa/platform-runtime-qa-harness/` | local validation input |
| Resource Registry implementation | `deployment/architecture/pumpkin-backup-export-restore/resource-registry-implementation/` | local validation input |
| OLM provider profile check | `deployment/architecture/outbound-link-manager/local-scanner-registry-implementation/` | local validation input |
| Backup Center proof | `deployment/architecture/pumpkin-backup-export-restore/phase-2f14-backup-generator-qa-signoff-result/` | carryforward input |

Generated `.tmp`, `.static-artifacts`, `.next`, and `out` evidence must not be staged.

