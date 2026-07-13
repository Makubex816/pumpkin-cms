# Validation Summary

## Result

V2.8.62DRT is `blocked_after_single_api_deploy_live_internal_redirect_validation_cross_platform_path_detection`.

The generic redirect capability is complete and passing locally. The single approved API deploy was successful and exposed the new auth-gated routes, but its Linux runtime rejected leading-slash internal routes during non-mutating validation. That cross-platform defect is corrected, tested, built, and packaged locally. The corrected package was not deployed because DRT used its only approved API deployment.

## Proof Summary

- Entry commit: `afca3b26fb4de5ccb53d369ccbcb9f45c2bee878` with subject `Document V2.8.62DRS meaningful redirect blocker`.
- Entry and final staged-file count: `0`.
- Required DRT result files: `27/27`.
- Durable DRT platform documents: `4/4`.
- Generic API focused proof: `53` assertions passed.
- Import planner safety proof: `7` safety classes passed.
- Redirect semantic proof: `7/7` passed.
- Page-contract regression proof: `6/6` passed.
- Starter runtime test, type check, and production build: passed.
- Pumpkin API Release build: `0` warnings and `0` errors.
- Deployment package safety: 56 entries; zero backslash, absolute, duplicate, protected-config, or `.tmp` entries.
- Approved API deployment attempts used: `1/1`; Azure status `RuntimeSuccessful`.
- Live route proof: API health `200`, no-auth Admin routes `401`, authenticated list `200` with zero generic Vegas redirects.
- Live validation result: blocked after both non-mutating payloads returned `400` due to the deployed cross-platform path-classification defect.
- Vegas dry-run: three declarations, one existing no-op, two deterministic future creates, zero blockers, zero cycles, zero writes.
- Live accounting: Vegas 43 pages, one page-owned redirect, zero generic redirects; all required counts unchanged.
- Ice and Party Pros: unchanged.
- Runtime no-regression: `39/39` approved GET checks passed.
- Tenant-data writes, DNS, TLS, publish, indexing, contact/form POST, FormEntry, storage-key/SAS, and Airstrip actions: `0`.

## Repository Validation

- DRT manifest parses as JSON.
- Changed JavaScript and MJS tools pass syntax checks.
- Final focused tests and builds pass from the corrected local source.
- Scoped `git diff --check` passes.
- Scoped trailing-whitespace and final-newline checks pass. New files and DRT diff hunks are ASCII; pre-existing non-ASCII text in `apps/pumpkin-api.Tests/Program.cs` is outside the DRT hunk.
- Scoped secret-assignment and disallowed-command scans report zero unsafe findings.
- No tenant-specific production routing condition is present.
- Generated build output and `.next` are excluded from staging and removed after validation.
- No files are staged.

## Exact-Path Commit Instructions

Do not use `git add -A`. Stage only this allowlist:

```powershell
git add -- `
  "apps/pumpkin-net-models/Models/TenantRedirect.cs" `
  "apps/pumpkin-api/Program.cs" `
  "apps/pumpkin-api/Services/CosmosDataConnection.cs" `
  "apps/pumpkin-api/Services/DatabaseService.cs" `
  "apps/pumpkin-api/Services/IDataConnection.cs" `
  "apps/pumpkin-api/Services/IDatabaseService.cs" `
  "apps/pumpkin-api/Services/MongoDataConnection.cs" `
  "apps/pumpkin-api/Services/TenantRedirects/TenantRedirectApiContracts.cs" `
  "apps/pumpkin-api/Services/TenantRedirects/TenantRedirectAuthorization.cs" `
  "apps/pumpkin-api/Services/TenantRedirects/TenantRedirectBackupContract.cs" `
  "apps/pumpkin-api/Services/TenantRedirects/TenantRedirectEndpoints.cs" `
  "apps/pumpkin-api/Services/TenantRedirects/TenantRedirectMutation.cs" `
  "apps/pumpkin-api/Services/TenantRedirects/TenantRedirectNormalizer.cs" `
  "apps/pumpkin-api/Services/TenantRedirects/TenantRedirectValidationService.cs" `
  "apps/pumpkin-api.Tests/Program.cs" `
  "apps/pumpkin-api.Tests/TenantRedirectSourceTestRunner.cs" `
  "apps/starter-app/src/lib/tenant-redirect-runtime.ts" `
  "apps/starter-app/src/middleware.ts" `
  "apps/starter-app/test/tenant-redirect-runtime.test.mjs" `
  "deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/tools/page-contract-validator/Program.cs" `
  "deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/tools/page-contract-validator/redirect-semantics-validator.mjs" `
  "deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/tools/page-contract-validator/test-redirect-semantics-validator.mjs" `
  "deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/tools/page-contract-validator/tenant-redirect-import-planner.mjs" `
  "deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/tools/page-contract-validator/test-tenant-redirect-import-planner.mjs" `
  "deployment/architecture/tenant-website-publish-readiness/v2-8-62drt-generic-redirect-support-result/README.md" `
  "deployment/architecture/tenant-website-publish-readiness/v2-8-62drt-generic-redirect-support-result/result-manifest.json" `
  "deployment/architecture/tenant-website-publish-readiness/v2-8-62drt-generic-redirect-support-result/current-state-summary.md" `
  "deployment/architecture/tenant-website-publish-readiness/v2-8-62drt-generic-redirect-support-result/v2-8-62drs-carryforward.md" `
  "deployment/architecture/tenant-website-publish-readiness/v2-8-62drt-generic-redirect-support-result/vegas-live-state-no-mutation-baseline.md" `
  "deployment/architecture/tenant-website-publish-readiness/v2-8-62drt-generic-redirect-support-result/existing-redirect-model-audit.md" `
  "deployment/architecture/tenant-website-publish-readiness/v2-8-62drt-generic-redirect-support-result/redirect-support-model-decision.md" `
  "deployment/architecture/tenant-website-publish-readiness/v2-8-62drt-generic-redirect-support-result/redirect-api-contract-result.md" `
  "deployment/architecture/tenant-website-publish-readiness/v2-8-62drt-generic-redirect-support-result/redirect-data-layer-result.md" `
  "deployment/architecture/tenant-website-publish-readiness/v2-8-62drt-generic-redirect-support-result/redirect-authorization-result.md" `
  "deployment/architecture/tenant-website-publish-readiness/v2-8-62drt-generic-redirect-support-result/route-precedence-and-conflict-policy.md" `
  "deployment/architecture/tenant-website-publish-readiness/v2-8-62drt-generic-redirect-support-result/redirect-normalization-and-cycle-validation.md" `
  "deployment/architecture/tenant-website-publish-readiness/v2-8-62drt-generic-redirect-support-result/redirect-import-validator-integration.md" `
  "deployment/architecture/tenant-website-publish-readiness/v2-8-62drt-generic-redirect-support-result/starter-local-redirect-runtime-result.md" `
  "deployment/architecture/tenant-website-publish-readiness/v2-8-62drt-generic-redirect-support-result/vegas-redirect-dry-run-validation.md" `
  "deployment/architecture/tenant-website-publish-readiness/v2-8-62drt-generic-redirect-support-result/focused-test-result.md" `
  "deployment/architecture/tenant-website-publish-readiness/v2-8-62drt-generic-redirect-support-result/api-build-result.md" `
  "deployment/architecture/tenant-website-publish-readiness/v2-8-62drt-generic-redirect-support-result/api-deployment-package-verification.md" `
  "deployment/architecture/tenant-website-publish-readiness/v2-8-62drt-generic-redirect-support-result/api-deploy-result.md" `
  "deployment/architecture/tenant-website-publish-readiness/v2-8-62drt-generic-redirect-support-result/redirect-endpoint-readiness-proof.md" `
  "deployment/architecture/tenant-website-publish-readiness/v2-8-62drt-generic-redirect-support-result/vegas-no-data-mutation-proof.md" `
  "deployment/architecture/tenant-website-publish-readiness/v2-8-62drt-generic-redirect-support-result/ice-party-pros-no-mutation-proof.md" `
  "deployment/architecture/tenant-website-publish-readiness/v2-8-62drt-generic-redirect-support-result/airstrip-no-request-proof.md" `
  "deployment/architecture/tenant-website-publish-readiness/v2-8-62drt-generic-redirect-support-result/runtime-no-regression-proof.md" `
  "deployment/architecture/tenant-website-publish-readiness/v2-8-62drt-generic-redirect-support-result/security-boundary-result.md" `
  "deployment/architecture/tenant-website-publish-readiness/v2-8-62drt-generic-redirect-support-result/validation-summary.md" `
  "deployment/architecture/tenant-website-publish-readiness/v2-8-62drt-generic-redirect-support-result/next-phase-prompt.md" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_TENANT_REDIRECT_API_CONTRACT_V2_8_62DRT.md" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_TENANT_REDIRECT_RUNTIME_RESOLUTION_STANDARD_V2_8_62DRT.md" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_TENANT_REDIRECT_IMPORT_VALIDATION_STANDARD_V2_8_62DRT.md" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_STRIP_CLUB_NEAR_ME_VEGAS_MEANINGFUL_REDIRECT_SUPPORT_V2_8_62DRT.md" `
  "PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_62DRT_GENERIC_REDIRECT_SUPPORT_REPORT.md"
git diff --cached --check
git commit -m "Add generic tenant redirect contract support"
```

V2.8.62DRU requires separate approval for the corrected API deployment and must prove both live validation payloads before any Vegas redirect write.
