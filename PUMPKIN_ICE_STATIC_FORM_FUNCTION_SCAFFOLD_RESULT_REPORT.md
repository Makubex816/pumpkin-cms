# Pumpkin Ice Static Form Function Scaffold Result Report

Generated: 2026-06-05

## Scope

Approved action: Ice static form Azure Function scaffold and route alignment only.

No endpoint was deployed. No Azure resources were created. No Azure Function App was created or deployed. No email was sent. No Microsoft 365 settings were touched. No CMS or MediaAsset writes occurred. No Cloudflare changes were made. No static deployment occurred. No protected config was read. Roller remains paused.

## Source Changes

Added deployable Function scaffold files:

```text
deployment/static-azure/forms/static-form-endpoint/azure-function-adapter.mjs
deployment/static-azure/forms/static-form-endpoint/azure-function-static-contact.mjs
deployment/static-azure/forms/static-form-endpoint/host.json
deployment/static-azure/forms/static-form-endpoint/local.settings.sample.json
deployment/static-azure/forms/static-form-endpoint/.funcignore
deployment/static-azure/forms/static-form-endpoint/test-azure-function-wrapper.mjs
```

Updated package/docs:

```text
deployment/static-azure/forms/static-form-endpoint/azure-function-contact.example.ts
deployment/static-azure/forms/static-form-endpoint/local-test-server.mjs
deployment/static-azure/forms/static-form-endpoint/package.json
deployment/static-azure/forms/static-form-endpoint/README.md
deployment/static-azure/forms/static-form-endpoint/DEPLOYMENT_INSTRUCTIONS.md
```

## Route Decision

Primary deployable route:

```text
/api/static-contact
```

The deployable scaffold registers:

```text
route: static-contact
host routePrefix: api
```

No deployed `/api/contact` compatibility route was added. `/api/contact` remains only as a local test server compatibility path for older local sample commands.

## Local Test Results

Run from:

```text
deployment/static-azure/forms/static-form-endpoint/
```

| Command | Exit | Result |
| --- | --- | --- |
| `npm run check` | 0 | pass |
| `npm test` | 0 | pass |

New wrapper tests verify route metadata, CORS preflight, no-email dry-run frontend payload acceptance, legacy payload acceptance through the primary route, invalid email rejection, unknown routing/recipient rejection, oversized message rejection, honeypot rejection, and no secret exposure in validation responses.

## Deployment State

Deployment remains blocked pending explicit approval.

Still not set:

```text
NEXT_PUBLIC_STATIC_FORM_ENDPOINT
STATIC_FORM_ENDPOINT_VERIFIED=true
```

Contact form production readiness remains `no`.

Strict static output quality gates remain `no`.

## Readiness Classification

| Gate | Status |
| --- | --- |
| static dry run completed | yes |
| static route output ready | yes |
| media production URL readiness | yes |
| static form endpoint local hardening | yes |
| static form Function scaffold readiness | yes |
| contact form production readiness | no |
| static output quality gates | no |
| endpoint deployment readiness | pending explicit approval |
| Azure staging readiness | no |
| DNS cutover readiness | no |
| production/indexing readiness | not live-ready |
| Roller | paused |

## Result Package

Created:

```text
deployment/azure/ice-static-form-function-scaffold-result/
```

The next approval should explicitly authorize endpoint deployment target, app settings handling, `/api/static-contact` route deployment, no-email verification, and whether Pumpkin API `FormEntry` persistence verification is allowed.
