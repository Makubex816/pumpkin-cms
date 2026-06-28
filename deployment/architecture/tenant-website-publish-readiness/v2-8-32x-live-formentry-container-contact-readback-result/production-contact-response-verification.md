# Production Contact Response Verification

Response verification:

- HTTP status: 400.
- Successful contact response: no.
- Returned entry ID: none.
- Response body was not copied into result files.

Source-backed likely cause:

Local static-contact compat validation expects allowlisted routing reference keys. The local test fixture uses:

- `staticEndpointRef`: `ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT`
- `leadRecipientRef`: `ICE_RINK_RENTALS_LEAD_RECIPIENT`

The submitted synthetic payload used literal public endpoint/email routing references. Based on source, that likely failed validation before Pumpkin API persistence.

No retry was sent.
