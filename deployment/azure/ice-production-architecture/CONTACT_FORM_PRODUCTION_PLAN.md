# Contact Form Production Plan

Mailbox status:

- Microsoft 365 Exchange Online Plan 1 remains the mailbox provider.
- `contact@iceskatingrinkrentals.com` is the selected mailbox metadata.
- The mailbox may be operational manually, but production app sending is not assumed live.

Contact form production requirements:

- The contact form production endpoint must be deployed and tested before production launch.
- Static form endpoint or Azure Function setup remains a separate setup gate.
- Form submission storage, notification flow, spam protection, and validation must be tested in staging.
- Pumpkin app sending remains dry-run unless separately configured and approved.
- Do not assume production email sending is live just because the mailbox works.

Current approved CMS form references:

- form key: `default-quote-request`
- source page: `/contact`
- static endpoint reference: `ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT`
- lead recipient reference: `ICE_RINK_RENTALS_LEAD_RECIPIENT`
- selected mailbox metadata: `contact@iceskatingrinkrentals.com`
- public email display policy: `form-first-under-review`

This package did not touch Microsoft 365 settings and did not send email.
