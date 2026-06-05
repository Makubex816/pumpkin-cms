# Package Verification Result

Generated: 2026-06-05

## Package

```text
deployment/static-azure/forms/static-form-endpoint/
```

## Verified Commands

Run locally from the package folder:

```powershell
cd deployment/static-azure/forms/static-form-endpoint
npm run check
npm test
```

Result:

| Command | Exit | Result |
| --- | --- | --- |
| `npm run check` | 0 | pass |
| `npm test` | 0 | pass |

## Test Coverage Confirmed

`npm test` confirmed:

- frontend `staticEndpointRef` and `leadRecipientRef` aliases are accepted
- legacy `domainRoutingKey` and `recipientGroup` fields still work
- missing routing field defaults to the configured Ice endpoint key
- missing recipient field defaults to the Ice lead recipient ref
- invalid email is rejected
- oversized message is rejected before sanitization truncation
- filled honeypot field is rejected
- unknown routing ref is rejected without echoing the submitted value
- unknown recipient ref is rejected without echoing the submitted value
- script-like message values are sanitized before mocked backend forwarding

## Deployment Readiness Caveat

The hardened handler package is verified locally, but it is not yet a complete Azure Function App project.

The package contains:

- reusable handler logic
- validation and sanitization helpers
- local test server
- package-local tests
- an Azure Function wrapper example

The package does not currently include a full deployment scaffold such as Azure Functions project metadata or deployed app settings. A future approved deployment should create or confirm the Function App scaffold, install required Function runtime dependencies, and decide the route before publishing.

## Boundaries Observed

No endpoint was deployed. No email was sent. No Microsoft 365 settings were touched. No Azure resources were created. No CMS or MediaAsset records were written. No Cloudflare changes were made. No static deployment occurred. Roller remains paused.
