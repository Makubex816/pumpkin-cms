# Ice Static Form Endpoint No-Email Deployment Result

Generated: 2026-06-05

## Scope

Approved work: deploy the Ice `/api/static-contact` Azure Function endpoint in no-email/mock verification mode only.

Not performed:

- real email sending
- Microsoft 365 changes
- production email provider configuration
- CMS writes
- MediaAsset writes
- Cloudflare changes
- static site deployment
- production website deployment
- root/www DNS changes
- `STATIC_FORM_ENDPOINT_VERIFIED=true` in repo or static build config
- Roller work

## Final Endpoint

```text
https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
```

Final Function App:

```text
func-ice-static-contact-20260605
```

Final resource group:

```text
rg-ice-static-form-endpoint
```

## Result

The endpoint is deployed and reachable over HTTPS in no-email `dry-run` mode.

Verification passed:

- `OPTIONS` CORS preflight
- valid frontend-style payload with `staticEndpointRef` and `leadRecipientRef`
- valid legacy payload
- invalid email rejection
- unknown routing rejection without echoing the submitted value
- unknown recipient rejection without echoing the submitted value
- oversized message rejection
- honeypot rejection
- unapproved origin rejection
- no submitted form values echoed in success response
- no secret values printed

## Readiness

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

## Files

- `DEPLOYMENT_SCOPE.md`
- `AZURE_RESOURCE_RESULT.md`
- `FUNCTION_DEPLOYMENT_RESULT.md`
- `APP_SETTINGS_NO_EMAIL_RESULT.md`
- `ENDPOINT_URL_RESULT.md`
- `HTTPS_ENDPOINT_TEST_RESULT.md`
- `VALIDATOR_WIRING_ANALYSIS.md`
- `REMAINING_FORM_PRODUCTION_BLOCKERS.md`
- `NEXT_EMAIL_MICROSOFT_365_APPROVAL_REQUIRED.md`
- `ROLLBACK_AND_DISABLE_NOTES.md`
- `manifest.json`
