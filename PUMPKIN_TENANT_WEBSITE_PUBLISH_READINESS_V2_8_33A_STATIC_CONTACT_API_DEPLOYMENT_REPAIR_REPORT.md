# V2.8.33A Static Contact API Deployment Repair Report

Date: 2026-06-29

Result: blocked before production.

V2.8.33A deployed the current static contact compat API package to the approved isolated Static Web App and proved that the isolated `/api/static-contact-health`, `/contact`, live Admin login, and authenticated Admin FormEntry readback preflights work.

The single approved isolated contact POST was sent and returned HTTP 502. No Admin-visible FormEntry was created. Per the V2.8.33A rules, production appsetting bind, production deployment, and production POST were not run.

Classification:

`isolated_static_contact_delivery_failed_http_502_after_api_deploy_no_production`

Public-safe evidence:

- Secure file readiness: passed; approved ignored secure file existed under `.tmp/` and was git-ignored.
- Static contact source readiness: passed; current compat API includes Pumpkin API persistence mode, protected key env lookup, and `/api/static-contact` plus `/api/static-contact-health`.
- Static contact compat checks: passed.
- Ice type-check and static validation: passed, with existing content warnings.
- Sanitized Ice static build: passed.
- Isolated appsetting bind: succeeded with output redacted.
- Isolated deploy: exactly one deploy succeeded to `https://kind-island-0a85a740f.7.azurestaticapps.net`.
- Isolated health: HTTP 200.
- Isolated contact page: HTTP 200; uses `/api/static-contact`, does not use `/api/contact`, and contains `contact@iceskatingrinkrentals.com`.
- Admin login/readback preflight: HTTP 200 login and HTTP 200 readback.
- Isolated POST: exactly one sent; HTTP 502.
- Production deploy/POST: not run.

Result package:

`deployment/architecture/tenant-website-publish-readiness/v2-8-33a-static-contact-api-deployment-repair-result/`

Commit instructions:

```powershell
git add "PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_33A_STATIC_CONTACT_API_DEPLOYMENT_REPAIR_REPORT.md" "deployment/architecture/tenant-website-publish-readiness/v2-8-33a-static-contact-api-deployment-repair-result/"
git commit -m "docs: add v2.8.33a static contact deployment repair result"
```
