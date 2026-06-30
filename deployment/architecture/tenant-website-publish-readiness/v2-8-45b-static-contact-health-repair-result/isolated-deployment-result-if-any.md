# Isolated Deployment Result

Isolated SWA deployment attempted: no.

Reason:

- The remaining likely repair is a static-contact SWA package redeploy.
- The approved secure file does not include a SWA deployment token or equivalent deployment credential.
- The process environment did not contain `SWA_CLI_DEPLOYMENT_TOKEN`, `SWA_CLI_PRODUCTION_DEPLOYMENT_TOKEN`, or `AZURE_STATIC_WEB_APPS_API_TOKEN`.
- Deployment token discovery or secret listing was not approved.

Hard stop:

`repair_requires_swa_deployment_token_not_in_approved_secure_file`

