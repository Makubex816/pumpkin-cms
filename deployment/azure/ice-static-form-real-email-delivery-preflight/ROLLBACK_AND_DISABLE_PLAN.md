# Rollback And Disable Plan

Generated: 2026-06-05

## First Rollback Switch

Return the endpoint to no-email mode:

```text
FORM_DELIVERY_MODE=dry-run
STATIC_FORM_FORWARD_MODE=dry-run
```

Use whichever setting is active in the future approved implementation.

## Disable Real Email

Future approved disable actions:

- remove or disable Graph delivery mode
- remove Graph client secret or certificate reference
- revoke the app credential if compromise is suspected
- remove Exchange Online RBAC role assignment or narrow mailbox scope
- disable the sending app identity if needed
- leave `/api/static-contact` online in dry-run mode if validator URL availability is still needed

## Static Site Impact

No static route or media rollback should be required for email disablement.

If production email verification is withdrawn:

```text
STATIC_FORM_ENDPOINT_VERIFIED should not be treated as production email verified
contact form production readiness returns to no
```

## Emergency Disable Options

Future approved emergency options:

- set allowed origins to an empty approved value
- restrict allowed site keys
- stop the Function App
- remove the endpoint URL from future static build config

These actions require explicit approval unless an emergency operations policy grants authority.

