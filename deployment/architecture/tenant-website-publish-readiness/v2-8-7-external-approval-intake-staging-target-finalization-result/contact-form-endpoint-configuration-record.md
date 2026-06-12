# Contact Form Endpoint Configuration Record

State: unresolved; non-secret endpoint candidate recorded.

## Candidate Evidence

| Field | Candidate value | Source |
| --- | --- | --- |
| Endpoint URL | `https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact` | `deployment/azure/ice-static-form-real-email-delivery-preflight/manifest.json` |
| Current endpoint mode | `dry-run` | `deployment/azure/ice-static-form-real-email-delivery-preflight/manifest.json` |
| Function app | `func-ice-static-contact-20260605` | `deployment/azure/ice-static-form-real-email-delivery-preflight/CURRENT_NO_EMAIL_ENDPOINT_STATE.md` |
| Resource group | `rg-ice-static-form-endpoint` | `deployment/azure/ice-static-form-real-email-delivery-preflight/CURRENT_NO_EMAIL_ENDPOINT_STATE.md` |
| Static no-email endpoint deployed | `true` | `deployment/azure/ice-static-form-real-email-delivery-preflight/manifest.json` |
| Contact form production readiness | `false` | `deployment/azure/ice-static-form-real-email-delivery-preflight/manifest.json` |

## Decision

The public no-email endpoint candidate is documented, but the publish validator gate remains unresolved for staging execution because the endpoint has not been approved for the current static build context and the current process environment did not supply an approved endpoint/verified flag.

## Missing Operator Inputs

- Approve whether this no-email dry-run endpoint may be used for staging validation.
- If yes, supply the public endpoint URL as an approved process-environment value for the sanitized build.
- Confirm whether `STATIC_FORM_ENDPOINT_VERIFIED=true` is allowed only for no-email staging context or remains blocked until real email delivery.
- Confirm the allowed origin set for the future staging target.
