# Implementation Options

## Option A: Existing Azure Function-Style Endpoint

Use the existing static form endpoint foundation and deploy it later as an Azure Function or equivalent companion service.

Future resources needed:

- one approved endpoint host
- server-side app settings
- public HTTPS endpoint URL
- monitoring/logging

Secrets needed as placeholders only:

- Pumpkin API key for Ice
- optional provider credentials only if email delivery is later approved

Validation/sanitization:

- use existing validation helpers
- add or confirm durable rate limiting
- add or confirm spam protection beyond honeypot if required
- align `staticEndpointRef`/`leadRecipientRef` with endpoint metadata handling

Approval required:

- endpoint deployment approval
- server-side secret/app-setting approval
- backend verification approval
- separate email/Microsoft 365 approval if email sending is required

Risk:

- lowest implementation risk because the code foundation already exists and syntax checks pass.

## Option B: Existing Pumpkin/API Public Form Endpoint

Use a hardened public Pumpkin/API endpoint if one already exists or is created later.

Future resources needed:

- public route exposure
- abuse protection
- CORS/origin allowlist
- server-side authentication/tenant controls

Approval required:

- API/public endpoint approval
- security review
- backend verification

Risk:

- avoids separate Function hosting, but exposing API surface may be broader than a narrow companion Function.

## Option C: Temporary Verified Staging Endpoint

Use a temporary verified endpoint only for staging validation.

Future resources needed:

- staging endpoint host
- staging-only allowed origins
- staging-safe test data

Approval required:

- staging endpoint approval
- staging verification approval

Risk:

- useful for proving browser-to-backend behavior, but it must not mark production form readiness yes.

## Option D: Wait For Email/Microsoft 365 And Endpoint Secrets

Do not configure or deploy any endpoint until all form, email, and secret approvals are granted.

Future resources needed:

- endpoint host
- Pumpkin API or destination credentials
- email/provider credentials if notification sending is required

Approval required:

- endpoint deployment
- secret storage
- Microsoft 365/email
- verification tests

Risk:

- safest for no-action boundaries, but keeps static output quality gates blocked.

## Recommended Option

Option A is the recommended next execution path after explicit approval: deploy or configure the existing endpoint foundation as an Ice-only endpoint first, verify save-to-Pumpkin behavior, and keep email sending separate.

