# Email Display Policy Decision

## Selected Mailbox

`contact@iceskatingrinkrentals.com` is documented as the selected mailbox for Ice email operations outside Pumpkin.

## Homepage Policy

- Public email display remains under review.
- Recommended launch posture is form-first.
- `domainRouting.publicContactEmail`, `quoteRequestEmail`, `supportEmail`, `replyToEmail`, and `fromEmail` remain empty in the candidate.
- `domainRouting.mailtoLinksEnabled` remains `false`.
- Pumpkin app sending remains dry-run/not configured.
- No real email was sent.
- No mailbox, DNS, Microsoft 365, Bluehost, Cloudflare, or Azure change was made.

## Placeholder Refs

- Lead recipient ref: `ICE_RINK_RENTALS_LEAD_RECIPIENT`
- Static form endpoint ref: `ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT`
- Future from-address ref: `MICROSOFT_365_FROM_ADDRESS_REF`
- Future reply-to ref: `MICROSOFT_365_REPLY_TO_ADDRESS_REF`

Before CMS import, approve either public display of the selected mailbox or an intentional form-first/no-public-email launch policy.
