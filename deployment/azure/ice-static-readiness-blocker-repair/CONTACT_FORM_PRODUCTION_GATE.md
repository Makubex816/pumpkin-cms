# Contact Form Production Gate

## Local CMS Policy

Local draft/live CMS pages may use the approved `formBlock` content.

The approved contact form metadata remains a content readiness signal, not proof that static-hosted form submission is production ready.

## Static Production Gate

Static production readiness now requires:

- a configured public static form endpoint URL
- HTTPS endpoint shape
- no localhost, loopback, placeholder, or example endpoint
- `STATIC_FORM_ENDPOINT_VERIFIED=true` only after backend/staging verification

The validators intentionally fail when the endpoint is missing or not marked verified.

## Microsoft 365 Distinction

The selected mailbox being operational does not equal app email sending or static form submission readiness. The static endpoint/backend must be deployed and tested separately.

No endpoint was deployed and no email was sent in this run.

