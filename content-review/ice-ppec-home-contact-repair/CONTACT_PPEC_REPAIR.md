# Contact PPEC Repair

Candidate:

- `UPDATED_CONTACT_WITH_PPEC_CANDIDATE.json`

PPEC blocks:

- CTA block index: 7
- CTA block id: `contact-ppec-partner-cta`
- CTA block type: `PrimaryCTA`
- Section variant: `partnerCta`
- FAQ block index: 8
- FAQ includes a Party Pros East Coast question and answer from the source package.

Form preservation:

- formBlock id: `contact-quote-form`
- formKey: `default-quote-request`
- sourcePage: `/contact`
- staticEndpointRef: `ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT`
- leadRecipientRef: `ICE_RINK_RENTALS_LEAD_RECIPIENT`
- selectedMailboxMetadata: `contact@iceskatingrinkrentals.com`

Repair content direction:

- The quote form remains primary.
- The PPEC CTA is placed after the quote form flow, not before it.
- No raw form HTML, CF7 runtime behavior, external scripts, or unsafe embeds were added.
