# Pumpkin Tenant Website Publish Readiness V2.8.32X Live FormEntry Container Contact Readback Report

Date: 2026-06-28 UTC

Phase status: blocked after one production contact POST attempt.

Classification: `production_contact_post_failed_http_400_no_retry`.

Result package:

`deployment/architecture/tenant-website-publish-readiness/v2-8-32x-live-formentry-container-contact-readback-result/`

## Summary

V2.8.32X resolved the V2.8.32W Admin readback blocker by creating the source-required `FormEntry` Cosmos container with partition key `/tenantId`.

After container creation, live Admin login returned HTTP 200 and issued a bearer token. The token was used only in memory. Authenticated Admin FormEntry readback preflight returned HTTP 200 with count `0`, so the production contact POST gate opened.

Static contact preflights passed. Exactly one synthetic non-PII production POST was then sent to `/api/static-contact` with V2.8.32X trace ID `v2-8-32x-production-contact-admin-persistence-20260628184619-ff7fea1e`.

The production POST returned HTTP 400 with no returned entry ID. No retry was sent. Bounded Admin polling ran after the sent POST and continued to return HTTP 200 with count `0`; the trace was not Admin-visible.

Source-backed likely cause for the POST 400: the local static-contact compat validation expects allowlisted routing reference keys such as `ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT` and `ICE_RINK_RENTALS_LEAD_RECIPIENT`, while the synthetic payload used literal public endpoint/email routing references. The live response body was not written into result files.

## Result

- `FormEntry` container before X: missing.
- `FormEntry` container operation: created.
- `FormEntry` partition key: `/tenantId`.
- Live Admin login: HTTP 200, bearer token issued.
- Admin FormEntry readback preflight: HTTP 200, count `0`.
- Static contact health: HTTP 200.
- Contact page: HTTP 200, uses `/api/static-contact`, does not use `/api/contact`, includes expected public email.
- Production contact POST count: 1.
- Production contact POST status: HTTP 400.
- Returned entry ID: none.
- Admin polling attempts after POST: 5.
- Admin readback found trace/entry: no.
- Contact gate: open.

## Security Boundary

- No deploy or redeploy occurred.
- No Azure App Service appsetting mutation occurred.
- No appsettings list/show occurred.
- No protected config file was intentionally read except `.tmp/v2-8-32x/secure/live-formentry-container-contact-readback.json`.
- No `.env.local`, appsettings file, local settings file, Key Vault secret query, keys/listKeys, connection string generation, SAS generation, DNS/custom-domain action, Search Console/indexing action, inbox access, or provider login occurred.
- Cosmos mutation was limited to creating the approved `FormEntry` container. The approved production POST returned HTTP 400 and did not create a visible FormEntry.
- No second production POST was sent.
- No bearer token, password, provider connection string, JWT secret, or password hash was printed or written into the result package.

## Validation

- `result-manifest.json` parsed successfully.
- Required result files: 20/20 present, 0 missing, 0 extra.
- `git diff --check` passed for the V2.8.32X root report and result package.
- Trailing whitespace scan passed for the V2.8.32X root report and result package.
- Secret-value scan passed for protected secure-file values, password hashes, and bearer JWT patterns.
- Source-change check: no V2.8.32X source edits were made.
- Staged file count: 0.

## Commit Instructions

Stage only these paths:

```powershell
git add "PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_32X_LIVE_FORMENTRY_CONTAINER_CONTACT_READBACK_REPORT.md" "deployment/architecture/tenant-website-publish-readiness/v2-8-32x-live-formentry-container-contact-readback-result/"
git commit -m "docs: add v2.8.32x FormEntry container result"
```

Do not stage `.tmp/`.
