# Form Routing Verification

Form routing ok: yes

Expected:

- formKey: `default-quote-request`
- sourcePage: `/contact`
- staticEndpointRef: `ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT`
- leadRecipientRef: `ICE_RINK_RENTALS_LEAD_RECIPIENT`
- selectedMailbox: `contact@iceskatingrinkrentals.com`
- publicEmailDisplayPolicy: `form-first-under-review`
- real email sending enabled: no
- WordPress/CF7 runtime: no

Checks:

| Check | Result |
| --- | --- |
| formBlockPresent | yes |
| formKey | yes |
| sourcePage | yes |
| staticEndpointRef | yes |
| leadRecipientRef | yes |
| selectedMailboxMetadata | yes |
| publicEmailDisplayPolicy | yes |
| noRawFormControls | yes |
| noRealEmailSending | yes |

Failed checks:

- None.
