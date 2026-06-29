# V2.8.32Y Carryforward

V2.8.32Y diagnosed the V2.8.32X HTTP 400 as a source-confirmed payload/request-contract failure.

Corrected Y payload included:

- Allowed `Origin`.
- Allowed `Referer`.
- Symbolic routing key `ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT`.
- Symbolic recipient key `ICE_RINK_RENTALS_LEAD_RECIPIENT`.
- `formId` and `formKey` as `default-quote-request`.
- Blank honeypot.

V2.8.32Y confirmed:

- Local corrected payload validation passed.
- Static-contact compat tests passed.
- Pumpkin health passed.
- Pumpkin API health passed.
- Static contact health passed.
- Contact page preflight passed.
- Live Admin login and Admin readback preflight passed.

V2.8.32Y then sent exactly one corrected production POST:

- Trace: `v2-8-32y-production-contact-admin-persistence-20260628190636-c96a10c5`.
- POST status: HTTP 502.
- Returned entry ID: none.
- Admin polling found no trace.
- Retry sent: no.

Starting blocker for V2.8.32Z:

`static_contact_delivery_failed_http_502_after_payload_correction_no_retry`
