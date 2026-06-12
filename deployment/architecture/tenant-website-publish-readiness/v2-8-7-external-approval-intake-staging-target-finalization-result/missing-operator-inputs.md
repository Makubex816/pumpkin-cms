# Missing Operator Inputs

Status: required before staging publish execution can be considered.

## Static Form Endpoint

- Approve whether `https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact` may be used for staging no-email validation.
- Supply approved process-environment value for the static build without protected config reads.
- Decide whether `STATIC_FORM_ENDPOINT_VERIFIED=true` may be used for no-email staging validation or only after real email delivery.

## Backend Verification

- Decide no-email staging versus real email delivery requirement.
- If real email is required, approve Microsoft 365, app identity, app settings, endpoint redeploy, and one live test email.
- Confirm approved recipient workflow.

## Owner Approvals

- Contact-form owner approval.
- Media/content approval for `/`, `/service-areas`, and `/contact`.
- Approval of no-media/empty-image state for staging.

## Staging Target

- Exact target platform.
- Exact subscription/resource group/resource name.
- Exact default hostname or staging hostname.
- Exact upload root.
- Safe deployment auth mode.
- Named operator, approver, and rollback/abort owner.

## Closed Future Gates

- DNS approval.
- Indexing approval.
- Live-publication approval.
