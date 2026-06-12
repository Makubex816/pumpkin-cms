# Missing Operator Inputs

Status: required before staging publish execution can be considered.

## Static Form Endpoint

- Supply the approved non-secret endpoint value for one of `NEXT_PUBLIC_STATIC_FORM_ENDPOINT`, `STATIC_FORM_ENDPOINT`, `NEXT_PUBLIC_STATIC_FORM_ACTION`, or `STATIC_FORM_ACTION`.
- Confirm whether `https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact` is approved for staging no-email validation.
- Provide endpoint owner approval via safe repo doc or explicit non-secret operator input.

## Backend Verification

- Decide whether no-email staging verification is sufficient or real email delivery is required.
- Provide `STATIC_FORM_ENDPOINT_VERIFIED=true` or `STATIC_FORM_BACKEND_VERIFIED=true` only after the approved verification context passes.
- If a live check is required, approve that future live check explicitly.

## Owner Approvals

- Contact-form owner approval.
- Media/content approval for `/`, `/service-areas`, and `/contact`.
- Approval of current no-media/empty-image state if that is intentional.

## Staging Target

- Exact target platform.
- Exact subscription/resource group/resource name.
- Exact default hostname or staging hostname.
- Exact upload root.
- Safe deployment auth mode.
- Named operator, approver, rollback owner, and abort owner.

## Closed Future Gates

- DNS approval.
- Indexing approval.
- Live-publication approval.
