# Pumpkin Tenant Website Publish Readiness V2.8.32Y Static Contact 400 Corrected Post Readback Report

Date: 2026-06-28 UTC

Phase status: blocked after one corrected production contact POST attempt.

Classification: `static_contact_delivery_failed_http_502_after_payload_correction_no_retry`.

Result package:

`deployment/architecture/tenant-website-publish-readiness/v2-8-32y-static-contact-400-corrected-post-readback-result/`

## Summary

V2.8.32Y diagnosed the V2.8.32X HTTP 400 as a request-contract issue. Local validator reproduction showed the X payload failed because it had no allowed `Origin` and used literal routing values instead of the source-required allowlisted routing reference keys.

The source-derived corrected payload:

- Sends `Origin: https://iceskatingrinkrentals.com`.
- Sends `Referer: https://iceskatingrinkrentals.com/contact`.
- Uses `staticEndpointRef: ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT`.
- Uses `leadRecipientRef: ICE_RINK_RENTALS_LEAD_RECIPIENT`.
- Uses `formId` and `formKey` as `default-quote-request`.
- Keeps honeypot fields blank.
- Includes the V2.8.32Y trace in the message.

Local validator checks passed for the corrected payload, and the static-contact compat test suite passed.

All live preflights passed before the corrected POST: Pumpkin health, Pumpkin API health, static contact health, contact page, live Admin login, and authenticated Admin FormEntry readback. The corrected production POST was then sent exactly once with trace ID `v2-8-32y-production-contact-admin-persistence-20260628190636-c96a10c5`.

The corrected POST returned HTTP 502 with no returned entry ID. No retry was sent. Bounded Admin polling ran five times and did not find the trace; Admin readback count remained `0`.

Source maps HTTP 502 from the static-contact handler to post-validation delivery failure after `deliverStaticFormEntry`. Since validation was locally proven and the live status moved from 400 to 502, the remaining blocker is delivery/runtime configuration or downstream delivery failure, not the static payload contract.

## Result

- Local X payload reproduction: failed validation.
- Local corrected payload validation: passed.
- Static-contact compat tests: passed.
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

- No deploy or redeploy occurred.
- No Azure resource mutation occurred.
- No Azure App Service appsetting mutation occurred.
- No appsettings list/show occurred.
- No protected config file was intentionally read except `.tmp/v2-8-32y/secure/live-admin-readback-for-contact-400.json`.
- No `.env.local`, appsettings file, local settings file, Key Vault secret query, keys/listKeys, connection string generation, SAS generation, DNS/custom-domain action, Search Console/indexing action, inbox access, or provider login occurred.
- Cosmos mutation was limited to the one possible FormEntry created by the approved corrected POST; the corrected POST returned HTTP 502 and no Admin-visible FormEntry was found.
- No second corrected production POST was sent.
- No bearer token, password, cookie, or other secret value was printed or written into the result package.

## Validation

- `result-manifest.json` parsed successfully.
- Required result files: 21/21 present, 0 missing, 0 extra.
- `git diff --check` passed for the V2.8.32Y root report and result package.
- Trailing whitespace scan passed for the V2.8.32Y root report and result package.
- Secret-value scan passed for approved secure-file password, bearer JWT patterns, and BCrypt hash patterns.
- Source-change check: no V2.8.32Y source edits were made.
- Static-contact local validation passed.
- Static-contact compat `npm test` passed.
- Staged file count: 0.

## Commit Instructions

Stage only these paths:

```powershell
git add "PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_32Y_STATIC_CONTACT_400_CORRECTED_POST_READBACK_REPORT.md" "deployment/architecture/tenant-website-publish-readiness/v2-8-32y-static-contact-400-corrected-post-readback-result/"
git commit -m "docs: add v2.8.32y static contact 400 diagnosis result"
```

Do not stage `.tmp/`.
