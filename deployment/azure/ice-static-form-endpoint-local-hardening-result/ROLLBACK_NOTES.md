# Rollback Notes

No cloud or CMS rollback is required because this was local source/docs/test hardening only.

To revert local hardening, revert changes to:

```text
deployment/static-azure/forms/static-form-endpoint/contact-handler.mjs
deployment/static-azure/forms/static-form-endpoint/validate-static-form-payload.mjs
deployment/static-azure/forms/static-form-endpoint/test-static-form-endpoint.mjs
deployment/static-azure/forms/static-form-endpoint/package.json
deployment/static-azure/forms/static-form-endpoint/sample-request.json
deployment/static-azure/forms/static-form-endpoint/sample-request-legacy.json
deployment/static-azure/forms/static-form-endpoint/README.md
deployment/static-azure/forms/static-form-endpoint/DEPLOYMENT_INSTRUCTIONS.md
```

Then rerun:

```powershell
cd deployment/static-azure/forms/static-form-endpoint
npm run check
npm test
```

No endpoint was deployed, no env var was changed, no email was sent, and no static site was deployed.

