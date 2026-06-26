# V2.8.26 Carryforward

V2.8.26 production evidence carried forward from the root report and result package.

Production contact API evidence:

- Production target: `swa-ice-static-staging`.
- Production `/contact` returned 200 and contained `/api/static-contact`.
- Production `/api/static-contact-health` returned 200.
- Health body `ok`: true.
- Health body `programmingModel`: `azure-functions-v3-function-json`.
- Production `OPTIONS /api/static-contact` returned 204.
- Exactly one production POST was sent.
- Production POST retry sent: false.
- Production POST returned 200.
- Production POST body `ok`: true.
- Trace ID: `v2-8-26-production-contact-20260626101926`.
- Entry ID: `ice-rink-rentals-default-quote-request-f9e8a6d2-3f9c-41d2-92e0-39f8ea83dbd5`.

Backend delivery status carried forward:

- Pending operator confirmation.

V2.8.27 did not rerun any production checks and did not submit another POST.
