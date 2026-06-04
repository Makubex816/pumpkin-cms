# Contact Form Production Readiness

## Current Approved Form State

The live contact page contains the approved form block:

- `formKey`: `default-quote-request`
- `sourcePage`: `/contact`
- `staticEndpointRef`: `ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT`
- `leadRecipientRef`: `ICE_RINK_RENTALS_LEAD_RECIPIENT`
- selected mailbox: `contact@iceskatingrinkrentals.com`
- public email display policy: `form-first-under-review`

No `contactus@` marker was found.

## Runtime Versus Static

In runtime mode, the frontend can submit through the Next `/api/contact` route.

In static export mode, `PageRenderer` requires a configured static form endpoint from static form endpoint environment values. Without that endpoint, static form submissions are intentionally not configured.

## Production/Staging Blockers

- External static form endpoint has not been deployed.
- Staging endpoint CORS has not been configured.
- Static frontend endpoint URL has not been supplied for export.
- Staging form submission has not been tested.
- Lead Inbox receipt has not been verified from static staging.
- Real email sending remains under separate approval.

## Readiness Result

Ready for production contact form: no.

The contact form content and routing refs are approved, but the static-host submission endpoint is still a setup gate.

