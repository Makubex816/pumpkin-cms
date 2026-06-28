# Pumpkin API Health After Auth Binding

Status: not run.

Reason:

Admin/JWT auth binding did not run because the approved secure file was missing `adminJwtSecretValue`.

No Web App restart occurred, so there was no after-binding health state to verify.

Health URLs reserved for a successful binding attempt:

- `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/health`
- `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/health`

