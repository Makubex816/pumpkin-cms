# V2.8.26 Carryforward

V2.8.26 completed the production managed API release verification.

Carryforward facts:

- Production-bound target: `swa-ice-static-staging`.
- Production `/contact`: returned 200 and contained `/api/static-contact`.
- Production `/api/static-contact-health`: returned 200 with `ok:true` and `programmingModel: azure-functions-v3-function-json`.
- Exactly one production contact POST was sent.
- Production POST status: `200`.
- Production POST `ok`: `true`.
- Trace ID: `v2-8-26-production-contact-20260626101926`.
- Entry ID: `ice-rink-rentals-default-quote-request-f9e8a6d2-3f9c-41d2-92e0-39f8ea83dbd5`.
- Backend delivery confirmation was left pending.

V2.8.30 did not call production endpoints and used repo-local evidence only.
