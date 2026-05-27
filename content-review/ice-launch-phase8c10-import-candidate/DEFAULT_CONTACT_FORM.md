# Default Contact / Quote Form

Phase 8C.11 adds Contact Form 7-style default form behavior for this review-only Ice package.

## Included Definitions

- `default-contact.form-definition.json`
- `default-quote-request.form-definition.json`

The Ice contact page uses `default-quote-request` through a visible `formBlock` section with id `contact-quote-form`.

## Non-Secret References

- Static endpoint reference: `ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT`
- Lead recipient reference: `ICE_RINK_RENTALS_LEAD_RECIPIENT`

These are reference names only. Real endpoint URLs, recipient email addresses, API keys, SMTP credentials, and deployment tokens must be configured outside page JSON.

## Public Contact Policy

The visible quote form is required on `/contact`.

Public phone and public email remain unresolved and are not faked. The form can work without displaying a public email address because routing uses non-secret internal reference names.

## Import Status

The form is render-ready for human review, but this package is still not CMS-import-ready until media, business values, approvals, and admin import/export preflight are complete.
