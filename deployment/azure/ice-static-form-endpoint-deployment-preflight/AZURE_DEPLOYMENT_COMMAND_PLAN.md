# Azure Deployment Command Plan

Generated: 2026-06-05

This is a future command plan only. No command in this file was run during this preflight.

## Preconditions For Future Execution

Explicit approval is required before:

- creating or selecting Azure resources
- creating a Function App scaffold
- deploying the endpoint
- setting app settings
- setting production/static build environment variables
- verifying backend persistence with approved credentials

## Recommended Function Target

```text
Function App: func-pumpkin-static-forms-staging
Route: /api/static-contact
Runtime: Azure Functions with a supported Node.js runtime
Package source: deployment/static-azure/forms/static-form-endpoint/
```

The package currently needs a Function App scaffold or packaging step before deployment. Confirm or create that scaffold under future approval.

## Future Scaffold Checklist

Before publish:

- include the hardened `contact-handler.mjs`
- include `validate-static-form-payload.mjs`
- include `sanitize-static-form-payload.mjs`
- include the package-local `azure-function-contact.example.ts` wrapper
- install the Azure Functions dependency required by the wrapper
- include Function project metadata required by the selected Azure Functions runtime
- decide whether wrapper route is `static-contact` or compatibility `contact`
- run `npm run check`
- run `npm test`

## Future App Setting Plan

Do not paste or commit real values.

Example shape only:

```powershell
az functionapp config appsettings set `
  --resource-group '<approved-resource-group>' `
  --name 'func-pumpkin-static-forms-staging' `
  --settings `
    PUMPKIN_API_URL='<approved Pumpkin API URL>' `
    ICE_RINK_RENTALS_API_KEY='<server-side secret>' `
    STATIC_FORM_ALLOWED_ORIGINS='<approved origins>' `
    STATIC_FORM_ALLOWED_SITE_KEYS='ice-rink-rentals' `
    STATIC_FORM_FORWARD_MODE='pumpkin-api' `
    STATIC_FORM_MAX_BODY_BYTES='20000' `
    STATIC_FORM_MAX_MESSAGE_LENGTH='4000' `
    STATIC_FORM_RATE_LIMIT_MODE='<approved mode>' `
    STATIC_FORM_SPAM_PROTECTION_MODE='<approved mode>' `
    ICE_RINK_RENTALS_STATIC_FORM_ENDPOINT_KEY='ice-rink-rentals-default'
```

## Future Publish Plan

Example shape only:

```powershell
func azure functionapp publish func-pumpkin-static-forms-staging
```

Or use the approved Azure deployment workflow for the selected Function App.

## Future Verification Commands

Use approved test-only data. Do not include secrets in command output.

Preflight:

```powershell
Invoke-WebRequest `
  -Uri 'https://<approved-form-endpoint-host>/api/static-contact' `
  -Method OPTIONS `
  -Headers @{ Origin = 'https://iceskatingrinkrentals.com' }
```

Valid POST:

```powershell
Invoke-WebRequest `
  -Uri 'https://<approved-form-endpoint-host>/api/static-contact' `
  -Method POST `
  -ContentType 'application/json' `
  -Headers @{ Origin = 'https://iceskatingrinkrentals.com' } `
  -InFile 'deployment/static-azure/forms/static-form-endpoint/sample-request.json'
```

Negative tests should use local/generated test payloads and must not include real customer data.

## Static Validator Wiring After Endpoint Verification

Future static build environment:

```text
NEXT_PUBLIC_STATIC_FORM_ENDPOINT=https://<approved-form-endpoint-host>/api/static-contact
STATIC_FORM_ENDPOINT_VERIFIED=true
```

Future validation commands:

```powershell
cd apps/ice-rink-web
npm run export:static:ice:cms
npm run validate:snapshot:ice
cd ../..
node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out apps/ice-rink-web/out
node deployment/static-azure/validate-staging-package.mjs --site ice-rink-rentals --folder apps/ice-rink-web/out
```

These commands were not run with endpoint env vars in this preflight.
