# Next Deployment Approval Required

Generated: 2026-06-05

The scaffold is ready for a separate endpoint deployment approval, but this pass did not authorize deployment.

## Next Approval Must Explicitly Include

- Azure target environment
- approved Function App name
- approved resource group or existing resource target
- route `/api/static-contact`
- app setting source and secret-handling process
- whether `STATIC_FORM_FORWARD_MODE` starts as `dry-run` or `pumpkin-api`
- approved test-only payload policy
- whether Pumpkin API `FormEntry` persistence verification is approved
- confirmation email remains disabled unless separately approved
- rollback trigger and rollback owner

## Suggested Next Prompt

```text
Approve Ice static form Azure Function endpoint deployment only: deploy the scaffolded package in deployment/static-azure/forms/static-form-endpoint/ to the approved Function App with primary route /api/static-contact, configure only approved Function App settings, run the documented no-email verification contract, and verify approved Pumpkin API FormEntry persistence if credentials are explicitly approved. Do not send email, do not change Microsoft 365, do not create Cloudflare/DNS changes, do not write CMS or MediaAsset records, do not deploy static output unless separately approved, and keep Roller paused.
```

## Still Blocked

- endpoint deployment
- endpoint URL configuration in static build
- `STATIC_FORM_ENDPOINT_VERIFIED=true`
- contact form production readiness
- strict static/staging validator pass
