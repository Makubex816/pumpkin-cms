# Pumpkin Tenant Website Publish Readiness V2.8.32R Live Admin Login Diagnosis Contact Readback Report

Date: 2026-06-28 UTC

Phase status: blocked before Admin auth repair and before production contact POST.

Classification: `provider_store_access_failed`.

Result package:

`deployment/architecture/tenant-website-publish-readiness/v2-8-32r-live-admin-login-diagnosis-contact-readback-result/`

## Summary

V2.8.32R diagnosed the V2.8.32Q live Admin login HTTP 500 using the approved ignored secure file and bounded App Service logs. The active failure is not a JWT support setting, an Admin seed, or a password mismatch. The live login reaches the provider-backed user lookup and throws:

`System.ArgumentException: The connection string is missing a required property: AccountEndpoint`

Health checks still return HTTP 200, but both `/health` and `/api/health` report `providerConfigured:false`. Because V2.8.32R explicitly forbids provider/contact/database secret mutation, the phase stopped before any provider repair and before production contact POST.

## Evidence

- Secure file existed, parsed, and was git-ignored by `.gitignore:35:.tmp/`.
- App Service filesystem application logging was enabled at error level for the diagnostic window.
- Logs were downloaded to ignored `.tmp/v2-8-32r/logs/`.
- Application logging was turned back off after diagnosis.
- Source shows `POST /api/auth/login` calls `IDatabaseService.GetUserByEmailAsync`.
- Source shows Cosmos provider routing creates `CosmosClient` from the configured Cosmos connection string.
- Logs show `POST /api/auth/login` returned HTTP 500 with missing `AccountEndpoint`.

## Gate Result

- Admin bearer token issued: no.
- Authenticated Admin FormEntry readback preflight: not run.
- Static contact preflight in R: not run.
- Production contact POST count: 0.
- Admin FormEntry readback after POST: not run.
- Contact gate: open.

## Security Boundary

- No deploy or redeploy occurred.
- No appsettings were listed or shown.
- No provider/contact/database secret was mutated.
- No JWT appsetting was changed in R.
- No Key Vault secret query, keys/listKeys, connection string generation, or SAS generation occurred.
- No DNS/custom-domain or indexing action occurred.
- No inbox/provider login occurred.
- No production contact POST was sent.
- No secret value was printed or written into the result package.

## Validation

- JSON parse for `result-manifest.json`: passed.
- `git diff --check` on the R root report and package: passed.
- Trailing whitespace scan on the R root report and package: passed.
- Required result file check: passed, 24 of 24 package files present.
- Secret-value scan against approved secure-file password/JWT values and bearer JWT patterns: passed.
- Staging check: passed, no files staged.

## Commit Instructions

Stage only these paths:

```powershell
git add "PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_32R_LIVE_ADMIN_LOGIN_DIAGNOSIS_CONTACT_READBACK_REPORT.md" "deployment/architecture/tenant-website-publish-readiness/v2-8-32r-live-admin-login-diagnosis-contact-readback-result/"
git commit -m "docs: add v2.8.32r admin login diagnosis result"
```

Do not stage `.tmp/`.
