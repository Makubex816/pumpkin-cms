# New Tenant Safe Onboarding Flow

1. Owner completes `.tmp/v2-8-61o/owner-input/new-tenant-intake-owner-values.json`.
2. Operator reviews for missing values and confirms no secrets are present.
3. Confirm source package path exists.
4. Run package analyzer only after analysis approval:
   `node deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/tools/intake-analyze-package.mjs --zip <zipPath> --out <proofDir> --tenant-id <tenantId>`
5. Resolve analyzer gaps or create owner action packet.
6. Run package compiler only after compiler approval:
   `node deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/tools/compile-normalized-package.mjs --analysis <analysisDir> --out <outputDir> --tenant-id <tenantId> --tenant-name <tenantName> --domain <domain> --www-domain <wwwDomain>`
7. Validate package schema and responsive routes.
8. Confirm media manifest and container policy.
9. Confirm TenantAdmin credential handoff exists outside repo.
10. Ask for separate approval before tenant creation.
11. Ask for separate approval before media upload.
12. Ask for separate approval before preview/deploy.
13. Ask for separate approval before DNS/custom-domain cutover.
14. Ask for separate approval before any contact/form/customer-facing POST proof.

No step above was executed beyond template creation and documentation in V2.8.61O.
