# Form Preview Notes

The final `/contact` draft readback from the prior local draft import verified:

- `formBlock` present.
- `formKey` is `default-quote-request`.
- `sourcePage` is `/contact`.
- `staticEndpointRef` is `ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT`.
- `leadRecipientRef` is `ICE_RINK_RENTALS_LEAD_RECIPIENT`.
- `selectedMailbox` metadata remains `contact@iceskatingrinkrentals.com`.
- `publicEmailDisplayPolicy` remains `form-first-under-review`.
- No raw CF7 or WordPress runtime behavior was present.
- No real email sending was enabled.

The preview route passes `staticFormEndpoint=""` through the shared draft preview renderer, so the preview does not enable real email sending.
