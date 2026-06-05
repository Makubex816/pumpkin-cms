# Ice Static Form Endpoint Deployment Preflight

Generated: 2026-06-05

## Scope

This package records the deployment preflight for the Ice static form endpoint only.

Approved work in this pass:

- verify the hardened endpoint package locally
- compare deployment target options
- define required environment placeholders
- define the endpoint URL contract
- define verification criteria
- define rollback and disable steps
- document validator wiring

Not approved and not performed:

- endpoint deployment
- email sending
- Microsoft 365 changes
- Azure resource creation
- Azure Function creation
- Azure Function deployment
- production environment variable changes
- CMS writes
- MediaAsset writes
- Cloudflare changes
- static deployment
- protected config reads
- Roller work

## Summary

Recommended future path: deploy the hardened static form endpoint package as an Ice-only Azure Function companion endpoint after explicit deployment approval.

Recommended public URL shape:

```text
https://<approved-form-endpoint-host>/api/static-contact
```

Compatibility URL if the current package wrapper route is deployed unchanged:

```text
https://<approved-form-endpoint-host>/api/contact
```

The existing package wrapper is named `static-contact` but currently declares `route: 'contact'`. A future approved deployment should either deploy that compatibility path intentionally or update the wrapper route to `static-contact` before deployment.

## Current Readiness

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

## Files

- `PACKAGE_VERIFICATION_RESULT.md`
- `DEPLOYMENT_TARGET_OPTIONS.md`
- `RECOMMENDED_DEPLOYMENT_PATH.md`
- `REQUIRED_ENVIRONMENT_VARIABLES.md`
- `ENDPOINT_VERIFICATION_CONTRACT.md`
- `NO_EMAIL_TEST_MODE_REVIEW.md`
- `AZURE_DEPLOYMENT_COMMAND_PLAN.md`
- `EMAIL_MICROSOFT_365_DEPENDENCY.md`
- `VALIDATOR_WIRING_PLAN.md`
- `ROLLBACK_AND_DISABLE_PLAN.md`
- `APPROVAL_REQUIRED_BEFORE_DEPLOYMENT.md`
- `NEXT_ENDPOINT_DEPLOYMENT_PROMPT.md`
- `manifest.json`

## Current Blockers

Strict static/staging validators should continue to fail the form endpoint gate until both are true:

- a real verified HTTPS endpoint URL is configured through the approved alias
- `STATIC_FORM_ENDPOINT_VERIFIED=true` is set after backend verification

No readiness report should mark contact form production readiness `yes` until that future deployment and verification pass.
