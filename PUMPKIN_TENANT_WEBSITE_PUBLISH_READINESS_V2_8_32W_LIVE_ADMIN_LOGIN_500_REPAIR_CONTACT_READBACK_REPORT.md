# Pumpkin Tenant Website Publish Readiness V2.8.32W Live Admin Login 500 Repair Contact Readback Report

Date: 2026-06-28 UTC

Phase status: blocked after live Admin login repair, before production contact POST.

Classification: `admin_formentry_readback_container_not_found_after_login_repair`.

Result package:

`deployment/architecture/tenant-website-publish-readiness/v2-8-32w-live-admin-login-500-repair-contact-readback-result/`

## Summary

V2.8.32W resolved the V2.8.32V live Admin login HTTP 500. Source and carryforward evidence showed login reached JWT generation after the repaired Admin identity passed password verification, while the source-required non-secret JWT support settings were absent in prior redacted config evidence.

The approved repair set only:

- `Jwt__Issuer`
- `Jwt__Audience`
- `Jwt__ExpirationMinutes`

The existing Web App was restarted once. No secret appsetting was changed in this phase, no appsettings list/show was run, and no source hotfix/deploy was required.

After the repair, live Admin login returned HTTP 200 and issued a bearer token. The token was used only in memory. The authenticated Admin FormEntry readback preflight then returned HTTP 500 because the source-required `FormEntry` Cosmos container was not found. Since the authenticated readback preflight failed, V2.8.32W stopped before the production contact POST.

## Result

- Live Admin login before repair: HTTP 500, no bearer token.
- Corrective repair: source-discovered non-secret JWT support appsettings set.
- Web App restart: completed once.
- Pumpkin API health after repair: `/health` 200 and `/api/health` 200.
- Live Admin login after repair: HTTP 200, bearer token issued.
- Admin FormEntry readback preflight: HTTP 500.
- Readback blocker: source-required `FormEntry` container returned Cosmos NotFound.
- Static contact preflights: approved URLs returned HTTP 200 and `/contact` used `/api/static-contact`.
- Production contact POST count: 0.
- Contact gate: open.

## Security Boundary

- No Azure resource creation or deletion occurred.
- No source hotfix or deploy occurred.
- No appsettings list/show was run.
- No secret appsetting was changed in this phase.
- No protected config file was intentionally read except `.tmp/v2-8-32w/secure/live-admin-login-500-repair.json`.
- A source search surfaced repo-local `appsettings.*.json.example` matches; no live/protected local appsettings file or secret value was opened or written.
- No `.env.local`, local settings file, Key Vault secret query, keys/listKeys, connection string generation, SAS generation, DNS/custom-domain action, Search Console/indexing action, inbox access, or provider login occurred.
- No production contact POST was sent.
- No bearer token, password, provider connection string, JWT secret, or password hash was printed or written into the result package.

## Validation

- `result-manifest.json` parsed successfully.
- Required result files: 24/24 present, 0 missing, 0 extra.
- `git diff --check` passed for the V2.8.32W root report and result package.
- Trailing whitespace scan passed for the V2.8.32W root report and result package.
- Secret-value scan passed for protected secure-file values, password hashes, and bearer JWT patterns.
- Source-hotfix check: no V2.8.32W source hotfix was made.
- Staged file count: 0.

## Commit Instructions

Stage only these paths:

```powershell
git add "PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_32W_LIVE_ADMIN_LOGIN_500_REPAIR_CONTACT_READBACK_REPORT.md" "deployment/architecture/tenant-website-publish-readiness/v2-8-32w-live-admin-login-500-repair-contact-readback-result/"
git commit -m "docs: add v2.8.32w login repair result"
```

Do not stage `.tmp/`.
