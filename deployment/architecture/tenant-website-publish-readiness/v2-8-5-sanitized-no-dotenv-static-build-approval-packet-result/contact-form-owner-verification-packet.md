# Contact Form Owner Verification Packet

Status: incomplete; owner verification required before staging execution.

The static form gate cannot be closed by mailbox readiness alone. The app needs an approved static form endpoint and backend verification for the Ice contact form.

## Required Owner Answers

| Item | Required response |
| --- | --- |
| Approved endpoint owner | Named business/technical owner for the form endpoint |
| Approved endpoint type | HTTPS endpoint, not local, not placeholder, not example |
| Backend verification | Evidence that the endpoint accepts the deployed static form payload shape |
| Recipient verification | Evidence that leads route to the approved mailbox/workflow |
| Abuse controls | Confirmation of spam/rate-limit/bot controls appropriate for public static form use |
| Privacy handling | Confirmation that submitted fields and retention behavior are approved |
| Failure behavior | Approved operator response for form delivery failures |
| Rollback/disable path | Approved way to disable or reroute the form if staging validation fails |
| Build-time variables | Approved process-env values available without protected config reads |

## Validator Closure Requirements

The next local validation pass must supply approved process-environment values, without printing them:

- one of `NEXT_PUBLIC_STATIC_FORM_ENDPOINT`, `STATIC_FORM_ENDPOINT`, `NEXT_PUBLIC_STATIC_FORM_ACTION`, or `STATIC_FORM_ACTION`
- `STATIC_FORM_ENDPOINT_VERIFIED=true`

Then rerun:

```text
npm run build:static:ice:sanitized
node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out <sanitized-out>
node deployment/static-azure/validate-staging-package.mjs --site ice-rink-rentals --folder <sanitized-out>
```

Do not write endpoint secrets into docs, Git, logs, or generated artifacts.
