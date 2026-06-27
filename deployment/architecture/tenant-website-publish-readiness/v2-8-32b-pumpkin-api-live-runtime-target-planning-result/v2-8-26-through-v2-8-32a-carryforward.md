# V2.8.26 Through V2.8.32A Carryforward

## V2.8.26

- Production target was `swa-ice-static-staging`.
- Public `/contact` posted to same-origin `/api/static-contact`.
- One approved production POST returned accepted success shape.
- Trace id: `v2-8-26-production-contact-20260626101926`.
- Entry id: `ice-rink-rentals-default-quote-request-f9e8a6d2-3f9c-41d2-92e0-39f8ea83dbd5`.
- Backend/Admin visibility stayed pending.

## V2.8.28

- Operator could not find the V2.8.26 trace/entry in Admin lead/contact submissions.
- This proved accepted response was not sufficient.

## V2.8.29

- Root cause: API acceptance without Admin-visible persistence.
- The compat endpoint can generate an accepted entry id without creating a Pumpkin `FormEntry`.
- Admin reads tenant-scoped `FormEntry` records from Pumpkin API.

## V2.8.30

- Remediation selected: `admin-persistence-required`.
- Public endpoint contract remains `/api/static-contact`.
- Required write target is Pumpkin API `POST /api/forms/ice-rink-rentals/entries`.
- Email-only does not close the gate.

## V2.8.31

- Local static contact adapter supports `FORM_DELIVERY_MODE=pumpkin-api`.
- `PUMPKIN_API_URL` is required in Pumpkin API mode.
- Protected key name: `PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY`.
- Mocked tests proved forwarding and returned Pumpkin API id handling.
- No deploy or protected binding occurred.

## V2.8.32A

- Safe Azure metadata showed production/isolated SWAs, static contact Function App, and Cosmos resources.
- `az webapp list` returned no live Pumpkin API Web App/App Service.
- Candidate publish-profile URL remained unverified/stale.
- Contact gate stayed open pending live Pumpkin API runtime wiring.

## V2.8.32B carryforward decision

The next implementation path must make Pumpkin API live first. Public contact persistence binding is downstream of API host exposure, provider binding, Admin binding, isolated QA, and Backup Center evidence.
