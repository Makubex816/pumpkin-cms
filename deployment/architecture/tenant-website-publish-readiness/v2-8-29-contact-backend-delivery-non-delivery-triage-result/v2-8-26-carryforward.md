# V2.8.26 Carryforward

Source reviewed:

- `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_26_CONTACT_MANAGED_API_PRODUCTION_RELEASE_REPORT.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-26-contact-managed-api-production-remediation-release-result/`

Carryforward facts:

- Production-bound target: `swa-ice-static-staging`.
- Production `/contact`: 200 and wired to `/api/static-contact`.
- Production `/api/static-contact-health`: 200, `ok:true`, Azure Functions v3 `function.json` programming model.
- Production `OPTIONS /api/static-contact`: 204.
- Exactly one production POST was sent in V2.8.26.
- Production POST result: status `200`, `ok:true`.
- Trace ID: `v2-8-26-production-contact-20260626101926`.
- Entry ID: `ice-rink-rentals-default-quote-request-f9e8a6d2-3f9c-41d2-92e0-39f8ea83dbd5`.
- Backend delivery confirmation was left pending.

V2.8.29 did not rerun the POST or call production endpoints.

