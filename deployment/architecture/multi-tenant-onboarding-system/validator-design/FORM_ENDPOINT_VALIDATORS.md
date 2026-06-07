# Form Endpoint Validators

Validate:

- form IDs are unique
- required fields are declared
- recipient and mailbox owner are declared
- consent/notice status is recorded
- delivery mode is supported by the selected deployment profile
- endpoint URL is present only when verified for that gate
- safe `OPTIONS` checks pass where applicable
- invalid payload checks do not create leads
- no valid form submission occurs unless explicitly approved
- rollback mode is documented

Form validators must never send email by default.

