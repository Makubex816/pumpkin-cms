# Pumpkin Ice Static Form Endpoint Deployment Preflight Report

Generated: 2026-06-05

## Scope

Approved action: Ice static form endpoint deployment preflight only.

No endpoint was deployed. No email was sent. No Microsoft 365 settings were touched. No Azure resources were created. No CMS or MediaAsset writes occurred. No Cloudflare changes were made. No static deployment occurred. No protected config was read. Roller remains paused.

## Package Verification

Verified package:

```text
deployment/static-azure/forms/static-form-endpoint/
```

Results:

| Command | Exit | Result |
| --- | --- | --- |
| `npm run check` | 0 | pass |
| `npm test` | 0 | pass |

Confirmed hardening coverage includes frontend alias mapping, legacy payload compatibility, default routing/recipient fallback, invalid email rejection, oversized message rejection, honeypot rejection, unknown routing/recipient rejection without echoing submitted values, and sanitized mocked backend forwarding.

## Recommended Deployment Path

Recommended future option: standalone Azure Function companion endpoint using the hardened static form endpoint package.

Recommended staging target placeholder:

```text
Function App: func-pumpkin-static-forms-staging
Route: /api/static-contact
Public URL: https://<approved-form-endpoint-host>/api/static-contact
Site scope: ice-rink-rentals only
```

Compatibility route if the package wrapper is deployed unchanged:

```text
https://<approved-form-endpoint-host>/api/contact
```

The wrapper should preferably be changed to `route: 'static-contact'` during a separately approved endpoint deployment, or the compatibility `/api/contact` route should be approved explicitly.

The package is verified locally but still needs a future Azure Function scaffold/packaging step before deployment.

## Required Future Environment Placeholders

Static frontend/build:

```text
NEXT_PUBLIC_STATIC_FORM_ENDPOINT=https://<approved-form-endpoint-host>/api/static-contact
STATIC_FORM_ENDPOINT_VERIFIED=true
```

Endpoint runtime app settings:

```text
PUMPKIN_API_URL=<approved Pumpkin API URL>
ICE_RINK_RENTALS_API_KEY=<server-side secret>
STATIC_FORM_ALLOWED_ORIGINS=https://iceskatingrinkrentals.com,https://www.iceskatingrinkrentals.com
STATIC_FORM_ALLOWED_SITE_KEYS=ice-rink-rentals
STATIC_FORM_FORWARD_MODE=pumpkin-api
STATIC_FORM_MAX_BODY_BYTES=20000
STATIC_FORM_MAX_MESSAGE_LENGTH=4000
STATIC_FORM_RATE_LIMIT_MODE=<approved mode>
STATIC_FORM_SPAM_PROTECTION_MODE=<approved mode>
ICE_RINK_RENTALS_STATIC_FORM_ENDPOINT_KEY=ice-rink-rentals-default
```

Ice payload routing refs:

```text
staticEndpointRef=ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT
leadRecipientRef=ICE_RINK_RENTALS_LEAD_RECIPIENT
```

No actual secrets are included in this report.

## Verification Contract

Before `STATIC_FORM_ENDPOINT_VERIFIED=true` may be set, the deployed endpoint must prove:

- real HTTPS URL, not local or placeholder
- approved-origin `OPTIONS` CORS behavior
- unapproved origins rejected
- current frontend payload accepted
- legacy payload accepted or intentionally documented
- invalid email rejected
- unknown routing and recipient refs rejected without echoing submitted values
- oversized payload/message rejected
- honeypot rejected
- public responses contain no secrets
- sanitized entry persisted through the approved backend path
- no email sent unless separately approved
- strict static and staging validators pass after endpoint URL and verification flag are set

## No-Email Mode

The endpoint package supports no-email verification:

- `STATIC_FORM_FORWARD_MODE=dry-run` validates without Pumpkin API persistence
- `STATIC_FORM_FORWARD_MODE=pumpkin-api` forwards to Pumpkin API and still does not send email from this package

Email and Microsoft 365 work remain separate gates.

## Remaining Blockers

- endpoint deployment not approved
- Function App scaffold/packaging still required
- endpoint URL not configured
- `STATIC_FORM_ENDPOINT_VERIFIED=true` not set
- backend persistence verification not performed
- contact form production readiness remains `no`
- strict static output quality gates remain `no`

## Readiness Classification

| Gate | Status |
| --- | --- |
| static dry run completed | yes |
| static route output ready | yes |
| media production URL readiness | yes |
| static form endpoint local hardening | yes |
| static form endpoint deployment preflight | yes |
| contact form production readiness | no |
| static output quality gates | no |
| endpoint deployment readiness | pending explicit approval |
| Azure staging readiness | no |
| DNS cutover readiness | no |
| production/indexing readiness | not live-ready |
| Roller | paused |

## Preflight Package

Created:

```text
deployment/azure/ice-static-form-endpoint-deployment-preflight/
```

The next approval should explicitly authorize endpoint deployment, route selection, Azure target, app settings handling, no-email verification mode, and whether Pumpkin API `FormEntry` persistence verification is allowed.
