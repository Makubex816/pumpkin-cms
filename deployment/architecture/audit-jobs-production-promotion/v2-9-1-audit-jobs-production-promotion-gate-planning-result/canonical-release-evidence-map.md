# Canonical Release Evidence Map

Result: complete.

This map defines the canonical V2.8 release evidence that future audit/job/promotion records must reference.

| Evidence area | Canonical source | Required trace fields |
| --- | --- | --- |
| Backend/contact readiness | `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_13_BACKEND_LIVE_POST_OPERATOR_ROLLBACK_NAMING_REPORT.md` | `v2Reference`, `tenantKey`, `siteKey`, `jobRunId`, `approvalReference`, `outcome` |
| Isolated staging deployment | `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_14C_DEPLOYMENT_AUTH_RETRY_SCOPED_ISOLATED_STAGING_DEPLOYMENT_REPORT.md` | `v2Reference`, `deploymentId`, `artifactRunId`, `artifactHash`, `outcome` |
| Isolated staging signoff | `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_15_POST_STAGING_VERIFICATION_OWNER_SIGNOFF_REPORT.md` | `v2Reference`, `approvalReference`, `rollbackPlanId`, `outcome` |
| Production release planning | `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_16_PRODUCTION_RELEASE_BOUNDARY_PLANNING_REPORT.md` | `v2Reference`, `boundaryGateId`, `approvalReference`, `outcome` |
| Production deployment | `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_17D_PRODUCTION_DEPLOY_WORKING_DIRECTORY_SEPARATION_CORRECTIVE_EXECUTION_REPORT.md` | `v2Reference`, `deploymentId`, `artifactRunId`, `artifactHash`, `jobRunId`, `outcome` |
| Production post-deployment verification | `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_18_OWNER_POST_DEPLOYMENT_VERIFICATION_INDEXING_APPROVAL_PACKET_REPORT.md` | `v2Reference`, `routeCheckId`, `runtimeQaRunId`, `resourceRegistryValidationId`, `olmValidationId`, `outcome` |
| Live contact-form verification and indexing deferral | `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_19_CONTACT_FORM_LIVE_SUBMISSION_INDEXING_HARD_STOP_DEFERRAL_REPORT.md` | `v2Reference`, `jobRunId`, `auditEventId`, `correlationId`, `boundaryGateId`, `outcome` |

Canonical production release facts:

- Tenant/site: `ice-rink-rentals`
- Production domains: `iceskatingrinkrentals.com`, `www.iceskatingrinkrentals.com`
- Canonical routes: `/`, `/service-areas`, `/contact`
- Production target: `swa-ice-static-staging` in `rg-ice-static-staging`
- Deployment id: `96fd744f-5589-4ac3-bebb-cfa99048dc0e`
- Artifact run/hash: `sanitized_20260613174033`, `506c6b4c99bcabed162466c79b299f900c6070855b90cd6f38ffae37fceff899`
- Contact-form verification: `verified_one_synthetic_non_pii_post`
- Indexing state: `deferred_hard_stop`

