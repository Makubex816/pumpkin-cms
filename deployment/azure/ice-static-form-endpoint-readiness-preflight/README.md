# Ice Static Form Endpoint Readiness Preflight

Date: 2026-06-05

Primary site: IceSkatingRinkRentals.com

Paused site: RollerRinkRentals.com

## Result

Preflight completed. No endpoint was deployed, no email was sent, no Microsoft 365 settings were touched, no Azure resources were created, no CMS or MediaAsset writes occurred, no Cloudflare changes were made, and Roller remained paused.

Fresh local baseline:

| Check | Result |
| --- | --- |
| `npm run export:static:ice:cms` | exit `0` |
| `npm run validate:snapshot:ice` | exit `0`, form warnings remain |
| strict static output validator | exit `1`, 2 form endpoint errors |
| strict staging package validator | exit `1`, 2 form endpoint errors |
| local media strings in public output | 0 |
| `latestSnapshot` mentions in public output | 0 |
| preview/obsolete paths | 0 |

## Recommendation

Use the existing local static form endpoint foundation in:

```text
deployment/static-azure/forms/static-form-endpoint/
```

Safest future path: deploy an Ice-only hardened Azure Function or equivalent companion endpoint after explicit approval, point the static frontend at its public HTTPS URL, verify backend behavior, then set `STATIC_FORM_ENDPOINT_VERIFIED=true` only after that verification passes.

## Later Local Hardening Status

On 2026-06-05, a later approved local hardening pass updated the endpoint package to accept and map the current frontend fields:

- `staticEndpointRef` -> `domainRoutingKey`
- `leadRecipientRef` -> `recipientGroup`

Legacy `domainRoutingKey`/`recipientGroup` payloads remain supported. Local package tests pass. No endpoint was deployed.

## Remaining Blocker

Contact form production readiness remains `no` because there is no verified production/static form endpoint.

## Files

- `CURRENT_FORM_VALIDATOR_ERRORS.md`
- `EXISTING_FORM_TOOLING_REVIEW.md`
- `IMPLEMENTATION_OPTIONS.md`
- `RECOMMENDED_FORM_ENDPOINT_PATH.md`
- `FORM_ENDPOINT_CONTRACT.md`
- `REQUIRED_ENVIRONMENT_VARIABLES.md`
- `VALIDATION_AND_SANITIZATION_PLAN.md`
- `EMAIL_DELIVERY_DEPENDENCY.md`
- `APPROVAL_REQUIRED_BEFORE_EXECUTION.md`
- `ROLLBACK_AND_DISABLE_PLAN.md`
- `NEXT_FORM_ENDPOINT_EXECUTION_PROMPT.md`
- `manifest.json`
