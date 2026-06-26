# V2.8.25 Carryforward

V2.8.25 isolated staging evidence carried forward cleanly into V2.8.26.

V2.8.25 result:

- Clean Azure Functions v3-compatible `function.json` package deployed exactly once to `swa-ice-static-isolated-staging`.
- Managed API discovery worked on isolated staging.
- `GET /api/static-contact-health` returned status 200.
- Health body `ok`: true.
- Health body `programmingModel`: `azure-functions-v3-function-json`.
- `OPTIONS /api/static-contact` returned status 204.
- Exactly one isolated synthetic POST returned status 200 and `ok: true`.
- Isolated entry ID: `ice-rink-rentals-default-quote-request-3dd6171a-62ef-48bb-9f7a-029759ac71ba`.
- Isolated trace: `v2-8-25-isolated-contact-20260626092010`.

Carryforward decision:

Use the same app-plus-API package shape for the production-bound remediation release, replacing only the deployment target with the approved production-bound SWA.
