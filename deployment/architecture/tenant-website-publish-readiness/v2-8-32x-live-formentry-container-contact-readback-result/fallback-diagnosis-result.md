# Fallback Diagnosis Result

Fallback classification:

`production_contact_post_failed_http_400_no_retry`

The V2.8.32W blocker was repaired:

- `FormEntry` container now exists.
- Authenticated Admin readback works.

The new blocker is at the public static contact validation/payload boundary. Source-backed likely cause is routing reference validation: the compat endpoint expects allowlisted reference keys for `staticEndpointRef` and `leadRecipientRef`.

No second POST is allowed in V2.8.32X.
