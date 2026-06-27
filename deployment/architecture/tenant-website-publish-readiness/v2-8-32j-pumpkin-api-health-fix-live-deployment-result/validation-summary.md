# Validation Summary

Validation completed on 2026-06-27.

Results:

| Check | Result |
| --- | --- |
| `result-manifest.json` parse | passed |
| Required package files | passed, 20 of 20 present |
| Root report present | passed |
| Scoped `git diff --check` | passed |
| Trailing whitespace scan | passed, 0 matches |
| Secret-like value scan | passed, 0 matches |
| URL/deploy-target scan | passed, URLs were limited to the selected Pumpkin API host and approved health routes |
| Boundary phrase scan | passed, matches were hard-stop confirmations only |
| Source implementation changes in J | passed, none |
| Artifact rebuild | not performed, fixed artifact SHA matched |
| Fixed deployment count | passed, exactly one deployment in J |
| Live health | passed, `/health` and `/api/health` returned `200 OK` |
| Staged files check | passed, no staged files |

Validated root report:

`PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_32J_PUMPKIN_API_HEALTH_FIX_LIVE_DEPLOYMENT_REPORT.md`

Validated result package:

`deployment/architecture/tenant-website-publish-readiness/v2-8-32j-pumpkin-api-health-fix-live-deployment-result/`
