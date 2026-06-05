# Next Endpoint Deployment Prompt

Generated: 2026-06-05

Use this only after deciding to approve endpoint deployment work.

```text
Approve Ice static form endpoint deployment only: deploy or configure the hardened endpoint package as an Ice-only Azure Function companion endpoint using the approved target, route, app settings placeholders, and verification contract from deployment/azure/ice-static-form-endpoint-deployment-preflight/. Verify OPTIONS/CORS, validation failures, no-email behavior, and approved Pumpkin API FormEntry persistence if credentials are explicitly approved. Do not send email, do not change Microsoft 365, do not create or change Cloudflare/DNS, do not write CMS or MediaAsset records except approved test FormEntry persistence through the endpoint, do not deploy static output unless separately approved, and keep Roller paused.
```

Suggested route decision to include in the next approval:

```text
Use /api/static-contact, and update the package wrapper route from contact to static-contact during the approved endpoint deployment work.
```

Suggested no-email constraint:

```text
Email notifications remain disabled. Microsoft 365 remains untouched. Verification is limited to endpoint validation and approved Pumpkin API FormEntry persistence.
```
