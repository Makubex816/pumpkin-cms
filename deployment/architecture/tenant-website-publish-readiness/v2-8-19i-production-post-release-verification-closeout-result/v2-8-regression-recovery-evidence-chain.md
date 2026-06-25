# V2.8 Regression Recovery Evidence Chain

Result: complete.

Evidence chain:

| Phase | Commit/report | Result |
| --- | --- | --- |
| V2.8.18 | `2310ba3` / `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_18_LIVE_SITE_REGRESSION_INVESTIGATION_REPORT.md` | Identified the public website regression and confirmed `swa-ice-static-staging` as production-bound by custom-domain attachment. |
| V2.8.19A | `2fbd51c` | Backup CMS recovery analysis established recovery path. |
| V2.8.19B | `378ba88` | Asset collection preflight prepared media recovery work. |
| V2.8.19C | `c5a5ba9` | Corrected PPEC logo manifest. |
| V2.8.19D | `ec10656` | Upload approval planning completed without media mutation. |
| V2.8.19E | `0c89137` | Existing Azure media target resolved. |
| V2.8.19F | `2286aec` / `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_19F_EXISTING_AZURE_MEDIA_SOURCE_INTEGRATION_REPORT.md` | Recovered `/`, `/service-areas`, and `/contact` source with existing Azure Blob media and public email. |
| V2.8.19G | `52e4e7a` / `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_19G_ISOLATED_STAGING_PREVIEW_REPORT.md` | Deployed exactly once to isolated staging and passed runtime QA. |
| V2.8.19H | `f69de00` / `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_19H_PRODUCTION_RELEASE_EXECUTION_REPORT.md` | Owner-approved production-bound deployment succeeded exactly once and six production route checks passed. |
| V2.8.19I | Current package | Post-release live verification passed and recovery lane closed. |

Conclusion:

The regression was investigated, recovered, previewed safely, owner-approved, deployed to the production-bound target, and verified live after release.

