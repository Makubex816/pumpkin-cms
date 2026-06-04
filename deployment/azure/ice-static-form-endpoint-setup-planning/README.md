# Ice Static Form Endpoint Setup Planning

Generated: 2026-06-04

## Scope

This package plans the future static form endpoint setup gate for IceSkatingRinkRentals.com.

Planning only. No endpoint was deployed, no Azure resources were created, no test email was sent, no Microsoft 365 settings were touched, no production env vars were set, no CMS records were changed, and no Roller work occurred.

## Current State

The Ice local static dry-run phase is closed.

The approved Ice snapshot contains form blocks on:

- `home`
- `contact`

The static output renders the pages, but strict production/staging validators fail because:

- no public static form endpoint env var is configured
- `STATIC_FORM_ENDPOINT_VERIFIED` is not `true`

Contact form production readiness remains `no`.

## Preferred Endpoint Shape

The existing static form strategy recommends an Azure Function or equivalent hardened public endpoint.

Recommended public endpoint path:

```text
/api/static-contact
```

Example public frontend value shape:

```text
NEXT_PUBLIC_STATIC_FORM_ENDPOINT=https://<function-host>/api/static-contact
```

The browser endpoint value is public by design and must contain only a URL, never secrets.

## Package Files

- `FORM_ENDPOINT_REQUIREMENTS.md`
- `VALIDATION_AND_SANITIZATION_REQUIREMENTS.md`
- `ENVIRONMENT_VARIABLES_REQUIRED.md`
- `LOCAL_TEST_PLAN.md`
- `AZURE_FUNCTION_OR_ENDPOINT_PLANNING.md`
- `EMAIL_DELIVERY_PLANNING.md`
- `APPROVAL_CHECKLIST.md`
- `REMAINING_RISKS.md`
- `manifest.json`

## Required Future Approvals

Explicit approval is required before:

- deploying an endpoint
- sending test email
- touching Microsoft 365
- setting production env vars
- setting `STATIC_FORM_ENDPOINT_VERIFIED=true`
- marking contact form production readiness `yes`

## Readiness

| Gate | Status |
| --- | --- |
| static dry run completed | yes |
| static route output ready | yes |
| static output quality gates | no |
| contact form production readiness | no |
| Azure staging readiness | no |
| DNS cutover readiness | no |

