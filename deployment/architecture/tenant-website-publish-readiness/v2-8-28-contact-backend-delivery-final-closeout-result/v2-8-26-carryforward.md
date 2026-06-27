# V2.8.26 Carryforward

Date reviewed: 2026-06-26

Source evidence:

- `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_26_CONTACT_MANAGED_API_PRODUCTION_RELEASE_REPORT.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-26-contact-managed-api-production-remediation-release-result/result-manifest.json`

## Production Release Evidence

V2.8.26 completed the managed API production release and production contact verification for `swa-ice-static-staging`.

Carried forward from repo-local evidence:

- Production-bound target: `swa-ice-static-staging`
- Production `/contact`: 200 and wired to `/api/static-contact`
- Production `/api/static-contact-health`: 200
- Health success flag: `ok: true`
- Health programming model: `azure-functions-v3-function-json`
- Production `OPTIONS /api/static-contact`: 204
- Production POST sent count: 1
- Production POST retry sent: false
- Production POST status: 200
- Production POST success flag: `ok: true`
- Trace ID: `v2-8-26-production-contact-20260626101926`
- Entry ID: `ice-rink-rentals-default-quote-request-f9e8a6d2-3f9c-41d2-92e0-39f8ea83dbd5`

## Backend Delivery State At V2.8.26 Close

Backend provider or inbox delivery remained pending operator confirmation. V2.8.26 did not access inbox/provider systems, read protected config, read app settings, or inspect secrets.

## Security Carryforward

V2.8.26 recorded that no isolated deployment, second production deployment, second production POST, DNS/custom-domain mutation, app settings mutation, Search Console/indexing action, sitemap submission, URL Inspection API call, Google Indexing API call, protected config read, deployment token print/list/export/reset, keys/listKeys, connection string generation, SAS generation, Azure media mutation, or backend provider login occurred.

