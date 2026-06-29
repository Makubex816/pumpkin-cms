# FormEntry No-Regression Carryforward

FormEntry/contact status:

- Contact gate remains closed.
- Key rotation remains closed_success.
- `FormEntry` container existed before V2.8.36 with partition key `/tenantId`.
- V2.8.36 did not send any contact POST.
- V2.8.36 did not validate new Form Definition behavior.

Read-only no-regression checks:

- Production `/api/static-contact-health`: 200.
- Production `/contact`: 200, references `/api/static-contact`, does not reference `/api/contact`, and contains the contact email.
- Isolated `/api/static-contact-health`: 200.
- Isolated `/contact`: 200, references `/api/static-contact`, does not reference `/api/contact`, and contains the contact email.

Compatibility tests passed for the static contact endpoint package.
