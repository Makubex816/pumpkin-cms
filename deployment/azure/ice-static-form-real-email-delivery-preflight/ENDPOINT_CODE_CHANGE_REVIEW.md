# Endpoint Code Change Review

Generated: 2026-06-05

## Current Local Package

Reviewed files:

- `deployment/static-azure/forms/static-form-endpoint/contact-handler.mjs`
- `deployment/static-azure/forms/static-form-endpoint/validate-static-form-payload.mjs`
- `deployment/static-azure/forms/static-form-endpoint/sanitize-static-form-payload.mjs`
- `deployment/static-azure/forms/static-form-endpoint/azure-function-adapter.mjs`
- `deployment/static-azure/forms/static-form-endpoint/azure-function-static-contact.mjs`
- `deployment/static-azure/forms/static-form-endpoint/README.md`
- `deployment/static-azure/forms/static-form-endpoint/DEPLOYMENT_INSTRUCTIONS.md`

## Findings

The package currently:

- exposes `/api/static-contact`
- keeps deployed `/api/contact` compatibility disabled
- validates method, content type, origin, payload size, site, form, routing, recipient, required fields, email shape, consent, honeypot, and message length
- sanitizes payload field keys and string values
- maps frontend `staticEndpointRef` to routing
- maps frontend `leadRecipientRef` to recipient group
- supports no-email `dry-run`
- can forward to Pumpkin API when configured, but current deployed endpoint is not configured for that

The package does not currently:

- acquire Microsoft Graph tokens
- send email through Microsoft Graph
- send SMTP mail
- render email subject/body templates
- store Microsoft 365 secrets
- implement durable rate limiting or CAPTCHA

## Required Future Code Change

Future approved work should add a delivery dispatcher, for example:

```text
FORM_DELIVERY_MODE=dry-run
FORM_DELIVERY_MODE=m365-graph
```

Implementation should:

- preserve current validation and sanitization behavior
- keep dry-run as the default when delivery settings are incomplete
- build a sanitized email message from `entry.formData`
- use Graph `/users/{sender}/sendMail`
- set `replyTo` from the submitter email only if policy approves it
- include no secrets, tokens, or recipient internals in public responses
- return the existing safe success shape after delivery acceptance
- log only a generated entry ID, delivery mode, and non-sensitive status
- expose Graph errors internally without echoing sensitive details to users

## Test Requirements

Future code tests should cover:

- dry-run still accepts valid payloads without sending
- Graph delivery mode builds the expected Graph JSON request with mocked `fetch`
- Graph token request uses server-side settings only
- Graph `202` returns safe public success
- Graph non-2xx returns safe public failure
- invalid email, unknown routing, unknown recipient, oversized message, honeypot, and unapproved origin still reject
- secret-like values are not echoed in responses

