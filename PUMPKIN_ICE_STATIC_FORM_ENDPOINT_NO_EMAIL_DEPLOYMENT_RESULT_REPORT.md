# Pumpkin Ice Static Form Endpoint No-Email Deployment Result Report

Generated: 2026-06-05

## Result

The Ice static form Azure Function endpoint is deployed and reachable in no-email `dry-run` mode.

Endpoint:

```text
https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
```

Function App:

```text
func-ice-static-contact-20260605
```

Resource group:

```text
rg-ice-static-form-endpoint
```

## Resources

Final Azure resources:

| Resource | Purpose |
| --- | --- |
| `iceforms20260605` | Function runtime storage |
| `func-ice-static-contact-20260605` | Ice static form Function App |
| `EastUSPlan` | required Windows Consumption plan |

An initial Linux Consumption attempt could not serve content because SCM/Kudu stayed at HTTP 503 and zip deployment failed. That failed Function App, its Linux plan, the unused package blob container, and the auto-created Application Insights component were deleted.

Azure rejected Node 20 because it reached end of life on 2026-04-30. The final endpoint uses Node 24 on Azure Functions v4.

## Verification

Local package checks:

| Command | Exit | Result |
| --- | --- | --- |
| `npm run check` | 0 | pass |
| `npm test` | 0 | pass |

HTTPS endpoint tests:

| Test | Status | Result |
| --- | --- | --- |
| `OPTIONS` approved origin | 204 | pass |
| valid frontend payload | 200 | pass |
| valid legacy payload | 200 | pass |
| invalid email | 400 | pass |
| unknown routing ref | 400 | pass |
| unknown recipient ref | 400 | pass |
| oversized message | 400 | pass |
| honeypot | 400 | pass |
| unapproved origin | 400 | pass |

The deployed route is `/api/static-contact`. No deployed `/api/contact` compatibility route was added.

## No-Email State

The Function App is configured for:

```text
STATIC_FORM_FORWARD_MODE=dry-run
```

No Pumpkin API key, Pumpkin API URL, email provider, sender, or recipient email app settings are configured by name.

No real email was sent. No Microsoft 365 settings were touched.

## Remaining Blockers

- no Pumpkin API `FormEntry` persistence verification
- no real email delivery verification
- no Microsoft 365 approval or testing
- no static build endpoint URL configured
- no `STATIC_FORM_ENDPOINT_VERIFIED=true`
- no strict static/staging validator rerun with endpoint env vars
- no static site deployment
- no DNS or Cloudflare cutover

Contact form production readiness remains `no`.

Static output quality gates remain `no`.

## Readiness Classification

| Gate | Status |
| --- | --- |
| static dry run completed | yes |
| static route output ready | yes |
| media production URL readiness | yes |
| static form endpoint local hardening | yes |
| static form Function scaffold readiness | yes |
| static form no-email endpoint deployed | yes |
| contact form production readiness | no |
| static output quality gates | no |
| endpoint deployment readiness | no-email endpoint deployed; production verification still pending |
| email/Microsoft 365 readiness | no |
| Azure staging readiness | no |
| DNS cutover readiness | no |
| production/indexing readiness | not live-ready |
| Roller | paused |

## Boundary Confirmation

No CMS writes, MediaAsset writes, Cloudflare changes, static site deployment, production website deployment, root/www DNS changes, or Roller work occurred.

No storage keys, connection strings, SAS URLs, publishing credentials, tokens, or email credentials are included in this report.
