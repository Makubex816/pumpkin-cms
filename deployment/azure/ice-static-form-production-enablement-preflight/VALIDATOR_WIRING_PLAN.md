# Validator Wiring Plan

Generated: 2026-06-06

## Validator Inputs

Strict static and staging validators read the endpoint URL from:

1. `NEXT_PUBLIC_STATIC_FORM_ENDPOINT`
2. `STATIC_FORM_ENDPOINT`
3. `NEXT_PUBLIC_STATIC_FORM_ACTION`
4. `STATIC_FORM_ACTION`

They require:

```text
STATIC_FORM_ENDPOINT_VERIFIED=true
```

## Recommended Future Validation Context

Use the preferred public endpoint variable:

```text
NEXT_PUBLIC_STATIC_FORM_ENDPOINT=https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
STATIC_FORM_ENDPOINT_VERIFIED=true
```

Optionally set `STATIC_FORM_ENDPOINT` to the same URL in a validator shell if a script or runbook expects the non-public alias.

## Future Commands

Documentation only. Do not run until explicit approval:

```powershell
$env:NEXT_PUBLIC_STATIC_FORM_ENDPOINT='https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact'
$env:STATIC_FORM_ENDPOINT='https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact'
$env:STATIC_FORM_ENDPOINT_VERIFIED='true'

cd apps/ice-rink-web
npm run export:static:ice:cms
npm run validate:snapshot:ice
cd ../..
node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out apps/ice-rink-web/out
node deployment/static-azure/validate-staging-package.mjs --site ice-rink-rentals --folder apps/ice-rink-web/out
```

Expected remaining form endpoint errors after approved configuration:

```text
none
```

This preflight did not set env vars, rebuild static output, or run validators.

