# Fallback Diagnosis Result

Fallback classification:

`isolated_static_contact_delivery_failed_http_502_after_api_deploy_no_production`

What is proven:

- The current compat API package deployed to isolated staging.
- The isolated health endpoint proves the managed API is present.
- The isolated contact page and static payload contract preflights passed.
- Live Pumpkin API Admin login and authenticated Admin readback passed.
- The isolated POST reached the static contact endpoint and returned public HTTP 502.
- Source maps public HTTP 502 to delivery failure after validation.

Likely failure zone:

- Static contact delivery to Pumpkin API returned non-OK or threw.
- Source-side possibilities include tenant API key mismatch, missing/incorrect runtime env value in the isolated managed API process, or a Pumpkin API FormEntry save failure.

What is not proven in this phase:

- The exact upstream Pumpkin API status for the isolated POST.
- The live isolated managed API environment values.
- Redacted function logs for the static contact invocation.

Those items require a new approved diagnostic phase. No direct write probe or second contact POST was run.
