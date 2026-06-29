# Pumpkin Tenant Website Publish Readiness V2.8.32Z Static Contact 502 Bridge Repair Readback Report

Date: 2026-06-28 UTC

Phase status: blocked after normalized static contact key repair and one corrected production POST attempt.

Classification: `static_contact_delivery_failed_http_502_after_normalized_key_repair_no_retry`.

Result package:

`deployment/architecture/tenant-website-publish-readiness/v2-8-32z-static-contact-502-bridge-repair-readback-result/`

## Summary

V2.8.32Z diagnosed the V2.8.32Y HTTP 502 as a post-validation static-contact delivery bridge failure. Source inspection confirmed that `contact-handler.mjs` returns HTTP 502 when delivery fails after payload validation, specifically after `deliverStaticFormEntry` throws.

The approved secure file showed the static contact bridge settings were source-shaped:

- Delivery mode resolves to Pumpkin API mode.
- Pumpkin API base URL matches the approved API base URL.
- Pumpkin API write route matches `/api/forms/ice-rink-rentals/entries`.
- Protected key env name matches `PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY`.
- Allowed site keys include `ice-rink-rentals`.
- Allowed origins include `https://iceskatingrinkrentals.com`.

The only source-discovered setting repair was the static contact protected Pumpkin API key: the raw secure value differed from the normalized value, and the secure whitespace flag was true. V2.8.32Z set only `PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY` on the approved Static Web App to the secure normalized value. The value was not printed or written.

After repair, local static-contact tests passed, public GET preflights passed, live Admin login returned HTTP 200, and authenticated Admin FormEntry readback returned HTTP 200 with count `0`.

Exactly one corrected production POST was then sent with trace ID `v2-8-32z-production-contact-admin-persistence-20260628203100-99e05c96`. It returned HTTP 502 with no entry ID. No retry was sent. Bounded Admin polling ran five times and did not find the trace; Admin count remained `0`.

## Result

- Static appsetting repair: set only `PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY` to the secure normalized value.
- Appsettings list/show: not run.
- Local static-contact tests: passed.
- Pumpkin health: HTTP 200.
- Pumpkin API health: HTTP 200.
- Static contact health: HTTP 200.
- Contact page: HTTP 200, uses `/api/static-contact`, not `/api/contact`.
- Live Admin login: HTTP 200, bearer token issued.
- Admin FormEntry readback preflight: HTTP 200, count `0`.
- Corrected production POST count: 1.
- Corrected production POST status: HTTP 502.
- Returned entry ID: none.
- Admin polling attempts after corrected POST: 5.
- Admin readback found trace/entry: no.
- Contact gate: open.

## Security Boundary

- No broad deploy or redeploy occurred.
- No Azure resource creation or deletion occurred.
- No appsettings list/show occurred.
- Static Web App appsetting mutation was limited to `PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY`.
- No unrelated appsetting mutation occurred.
- No protected config file was intentionally read except `.tmp/v2-8-32z/secure/static-contact-502-diagnosis.json`.
- No `.env.local`, appsettings file, local settings file, Key Vault secret query, keys/listKeys, connection string generation, SAS generation, DNS/custom-domain action, Search Console/indexing action, inbox access, or provider login occurred.
- No direct Cosmos mutation occurred.
- No tenant API key record alignment was performed.
- No second corrected production POST was sent.
- No static contact API key value, provider connection string, admin password, bearer token, cookie, or password hash was printed or written into the result package.

## Validation

- `result-manifest.json` parsed successfully.
- Required result files: 23/23 present, 0 missing, 0 extra.
- `git diff --check` passed for the V2.8.32Z root report and result package.
- Trailing whitespace scan passed for the V2.8.32Z root report and result package.
- Secret-value scan passed for approved secure-file protected values, bearer JWT patterns, and BCrypt hash patterns.
- Static-contact compat `npm test` passed.
- Source-change check: no V2.8.32Z source edits were made.
- Staged file count: 0.

## Commit Instructions

Stage only these paths:

```powershell
git add "PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_32Z_STATIC_CONTACT_502_BRIDGE_REPAIR_READBACK_REPORT.md" "deployment/architecture/tenant-website-publish-readiness/v2-8-32z-static-contact-502-bridge-repair-readback-result/"
git commit -m "docs: add v2.8.32z static contact bridge result"
```

Do not stage `.tmp/`.
