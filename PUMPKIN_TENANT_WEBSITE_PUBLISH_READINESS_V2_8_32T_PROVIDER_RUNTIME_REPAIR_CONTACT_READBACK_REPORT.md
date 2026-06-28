# Pumpkin Tenant Website Publish Readiness V2.8.32T Provider Runtime Repair Contact Readback Report

Date: 2026-06-28 UTC

Phase status: blocked before Admin readback and before production contact POST.

Classification: `admin_login_unauthorized_after_provider_binding`.

Result package:

`deployment/architecture/tenant-website-publish-readiness/v2-8-32t-provider-runtime-repair-contact-readback-result/`

## Summary

V2.8.32T diagnosed why V2.8.32S still saw `providerConfigured:false` after provider appsettings were bound. Source inspection proved that health response is dependency-light and hardcodes `providerConfigured:false` plus `providerStatus:"not_checked"`. It is not a real provider readiness probe in the current build.

Redacted App Service verification showed the source-discovered provider settings and `Jwt__SecretKey` are present, non-empty, and match the approved secure-file values. No raw values were printed.

A live Admin login attempt then returned HTTP 401 instead of the previous provider exception. That proves provider-backed auth lookup is active, but the Admin login is now blocked by missing/inactive user or password mismatch. No source-discovered Admin seed/repair API path exists, so the phase stopped before Admin readback and before production contact POST.

## Result

- Provider secure-file shape: passed.
- Provider appsettings: present and matched secure values by redacted check.
- Health: HTTP 200, but source-hardcoded `providerConfigured:false`.
- Source hotfix/deploy: not performed.
- Admin login: HTTP 401.
- Bearer token issued: no.
- Admin readback preflight: not run.
- Static contact preflight: not run.
- Production contact POST count: 0.
- Contact gate: open.

## Security Boundary

- No raw appsetting values were printed.
- No protected config file was read except `.tmp/v2-8-32t/secure/live-provider-runtime-repair.json`.
- No appsettings file, `.env.local`, or local settings file was read.
- No Key Vault secret query, keys/listKeys, connection string generation, or SAS generation occurred.
- No DNS/custom-domain or indexing action occurred.
- No inbox/provider login occurred.
- No production contact POST was sent.
- No secret value was printed or written into the result package.

## Validation

- JSON parse for `result-manifest.json`: passed.
- `git diff --check` on the T root report and result package: passed.
- Trailing whitespace scan on the T root report and result package: passed.
- Required result file check: passed, 24 of 24 package files present.
- Secret-value scan for approved secure-file protected values and bearer JWT patterns: passed.
- Staging check: passed, no files staged.

## Commit Instructions

Stage only these paths:

```powershell
git add "PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_32T_PROVIDER_RUNTIME_REPAIR_CONTACT_READBACK_REPORT.md" "deployment/architecture/tenant-website-publish-readiness/v2-8-32t-provider-runtime-repair-contact-readback-result/"
git commit -m "docs: add v2.8.32t provider runtime repair result"
```

Do not stage `.tmp/`.
