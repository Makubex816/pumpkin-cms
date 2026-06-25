# Contact Source Remediation Result

Result: source remediation implemented.

Changed source:

- `apps/ice-rink-web/src/lib/render-mode.ts`
- `apps/ice-rink-web/scripts/static-publish.mjs`
- `deployment/static-azure/validate-static-output.mjs`
- `deployment/static-azure/validate-staging-package.mjs`
- `deployment/static-azure/scripts/ice-isolated-swa-deploy-readiness.mjs`
- `deployment/static-azure/forms/static-form-endpoint/.funcignore`
- `deployment/static-azure/forms/static-form-endpoint/contact-handler.mjs`
- `deployment/static-azure/forms/static-form-endpoint/validate-static-form-payload.mjs`
- `deployment/static-azure/forms/static-form-endpoint/test-static-form-endpoint.mjs`
- `deployment/static-azure/forms/static-form-endpoint/test-azure-function-wrapper.mjs`

Behavioral change:

- Ice static render mode now defaults the public form endpoint to `/api/static-contact` when no explicit public endpoint env var is supplied.
- Runtime mode remains unchanged and continues to use `/api/contact`.
- Roller remains unchanged.
- Validators now classify `/api/static-contact` as an approved same-origin Static Web Apps API path.
- The static contact function accepts the isolated staging default origin.
- `.funcignore` now excludes `local.settings.*`.

The public contact email remains `contact@iceskatingrinkrentals.com`.
