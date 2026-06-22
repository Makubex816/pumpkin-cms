# Deployment Evidence Timeline

| Phase or source | Evidence | Result |
| --- | --- | --- |
| V2.8.14C | `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_14C_DEPLOYMENT_AUTH_RETRY_SCOPED_ISOLATED_STAGING_DEPLOYMENT_REPORT.md` | Deployed `sanitized_20260612235412` to isolated staging `swa-ice-static-isolated-staging`; three route checks passed. |
| V2.8.15 | `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_15_POST_STAGING_VERIFICATION_OWNER_SIGNOFF_REPORT.md` | Isolated staging readiness signed off only; no production deployment. |
| V2.8.16 | `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_16_PRODUCTION_RELEASE_BOUNDARY_PLANNING_REPORT.md` | Production-bound target identified as `swa-ice-static-staging`; production release planned. |
| V2.8.17D | `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_17D_PRODUCTION_DEPLOY_WORKING_DIRECTORY_SEPARATION_CORRECTIVE_EXECUTION_REPORT.md` | Deployed `sanitized_20260613174033` to `swa-ice-static-staging`; deployment id `96fd744f-5589-4ac3-bebb-cfa99048dc0e`; six production route checks passed. |
| Prior V2.8.18 verification | `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_18_OWNER_POST_DEPLOYMENT_VERIFICATION_INDEXING_APPROVAL_PACKET_REPORT.md` | Verified production route availability and froze deployment evidence; owner business/content acknowledgement still pending. |
| Indexing cleanup result | `deployment/azure/ice-production-indexing-cleanup-result/manifest.json` | Documents a later approved static output redeploy to `swa-ice-static-staging`; artifact is still a three-route output. |
| V2.8.18 regression investigation | this package | Read-only investigation only; no production deploy or live route fetch. |

The timeline proves that isolated staging was used before the production-bound deployment. The timeline also shows the missing gate: owner visual/content completeness was not strong enough to prevent a minimal static page set from reaching the production-bound target.

