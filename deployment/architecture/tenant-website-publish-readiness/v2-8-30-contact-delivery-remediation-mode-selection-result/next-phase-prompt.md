# Next Phase Prompt: V2.8.31 Contact Admin Persistence Implementation Preflight

Approve V2.8.31 Contact Admin Persistence Implementation Preflight only: implement and locally validate the Admin-persistence path for IceSkatingRinkRentals.com contact submissions so the static compat contact API, when configured for Pumpkin API delivery, writes a Pumpkin `FormEntry` through `POST /api/forms/ice-rink-rentals/entries` in the same provider Admin reads.

Approved scope:

- Inspect V2.8.30 result package.
- Modify local compat endpoint tests only as needed to prove `FORM_DELIVERY_MODE=pumpkin-api` forwarding with a mocked `fetch`.
- Optionally add small source hardening if the test reveals a local bug in forwarding, validation, redaction, or error behavior.
- Do not read protected config values.
- Do not list/show Azure app settings.
- Do not deploy.
- Do not send any contact form POST to staging or production.
- Do not call production endpoints.
- Do not access inbox/provider systems.
- Do not mutate Azure, DNS, custom domains, Search Console, or indexing.

Required implementation proof:

- A local mocked test sets `FORM_DELIVERY_MODE=pumpkin-api`.
- The test uses a fake Ice API key value without printing it.
- The test asserts the compat handler calls `/api/forms/ice-rink-rentals/entries`.
- The test asserts the outbound payload has tenant `ice-rink-rentals`, form ID/form key `default-quote-request`, `metadata.source=static-form-endpoint`, and expected routing refs.
- The test asserts no real network call is made.
- Existing dry-run and validation tests still pass.

Protected values remain separately gated:

- `PUMPKIN_API_URL`.
- `ICE_RINK_RENTALS_API_KEY`.
- Runtime app setting changes for `FORM_DELIVERY_MODE=pumpkin-api`.

Acceptance:

- V2.8.31 root report exists.
- V2.8.31 result package exists.
- Mocked Pumpkin API forwarding test exists and passes.
- No deploy occurred.
- No contact POST occurred.
- No protected config read occurred.
- Exact-path commit instructions are provided.
