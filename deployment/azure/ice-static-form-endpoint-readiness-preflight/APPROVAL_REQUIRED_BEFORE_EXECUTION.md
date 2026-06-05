# Approval Required Before Execution

This preflight did not execute endpoint setup.

Explicit approval is required before:

- deploying an Azure Function or other endpoint
- creating Azure resources
- changing Azure app settings
- configuring endpoint secrets
- setting `NEXT_PUBLIC_STATIC_FORM_ENDPOINT`
- setting `STATIC_FORM_ENDPOINT_VERIFIED=true`
- sending any email
- touching Microsoft 365
- changing DNS or Cloudflare
- changing CMS page/form records
- changing MediaAsset records
- deploying the static site
- marking contact form production readiness `yes`

## Minimum Future Approval Bundle For Endpoint Verification

Future endpoint execution should be approved with:

- endpoint host/resource target
- public endpoint URL shape
- Ice-only allowed site key
- allowed origins
- server-side Pumpkin API settings approval
- test payload policy
- whether Pumpkin API forwarding is allowed
- whether email must remain disabled

Without that approval bundle, keep:

```text
contact form production readiness: no
static output quality gates: no
Azure staging readiness: no
production/indexing readiness: not live-ready
```

