# Next Form Endpoint Execution Prompt

Use this only after explicit approval for endpoint execution.

```text
Approve Ice static form endpoint execution only.

Scope:
- Use the existing deployment/static-azure/forms/static-form-endpoint foundation.
- Configure/deploy the approved Ice-only static form endpoint at the approved HTTPS URL.
- Keep allowed site keys limited to ice-rink-rentals.
- Configure allowed origins exactly as approved.
- Configure server-side Pumpkin API settings in approved secret storage only.
- Do not print secrets.
- Do not send email unless separately approved.
- Verify local dry-run validation, bad payload rejection, CORS/origin behavior, backend FormEntry persistence, no-secret exposure, and static validator clearance.
- Set STATIC_FORM_ENDPOINT_VERIFIED=true only after backend verification passes.
- Rerun Ice static export, snapshot validator, strict static validator, and strict staging validator.
- Update reports/docs.

Do not:
- touch Microsoft 365 unless separately approved
- create unrelated Azure resources
- change Cloudflare or DNS
- update CMS records
- update MediaAsset records
- deploy the static site
- touch Roller
```

