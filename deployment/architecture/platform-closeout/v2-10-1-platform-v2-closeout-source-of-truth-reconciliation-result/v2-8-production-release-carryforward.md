# V2.8 Production Release Carryforward

Carryforward status: complete with indexing deferred.

Canonical closeout references:

- V2.8.17D root report: `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_17D_PRODUCTION_DEPLOY_WORKING_DIRECTORY_SEPARATION_CORRECTIVE_EXECUTION_REPORT.md`
- V2.8.18 root report: `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_18_OWNER_POST_DEPLOYMENT_VERIFICATION_INDEXING_APPROVAL_PACKET_REPORT.md`
- V2.8.19 root report: `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_19_CONTACT_FORM_LIVE_SUBMISSION_INDEXING_HARD_STOP_DEFERRAL_REPORT.md`

Facts carried forward:

- Production static deployment to `swa-ice-static-staging` succeeded in V2.8.17D.
- Deployment id: `96fd744f-5589-4ac3-bebb-cfa99048dc0e`.
- Artifact run: `sanitized_20260613174033`.
- Artifact aggregate SHA-256: `506c6b4c99bcabed162466c79b299f900c6070855b90cd6f38ffae37fceff899`.
- Six production route checks returned `200 OK`.
- V2.8.18 reconfirmed production static release, evidence freeze, Runtime QA, Resource Registry / Provider Profile, OLM, and static form local validation.
- V2.8.19 recorded owner/operator acknowledgement and exactly one approved synthetic non-PII contact-form POST, returning `200 OK`, `ok=true`, public success message, and entry ID present.

Deferred:

- Google/Search Console/indexing remains hard-stopped and deferred.

Security carryforward:

- No additional deployment/redeployment, DNS/custom-domain mutation, Search Console/indexing action, crawl, outbound live URL check, CMS/provider write, Azure mutation, protected config read, deployment/OAuth token print/export/list/use, key/listKeys, connection string generation, or SAS generation occurred in this V2.10.1 reconciliation.
