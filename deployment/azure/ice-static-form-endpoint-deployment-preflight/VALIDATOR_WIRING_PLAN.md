# Validator Wiring Plan

Generated: 2026-06-05

## Current Validator Behavior

Ice static validators require a form endpoint because `ice-rink-rentals` has `requiresStaticFormEndpoint: true`.

The endpoint URL is read from these aliases, in order:

1. `NEXT_PUBLIC_STATIC_FORM_ENDPOINT`
2. `STATIC_FORM_ENDPOINT`
3. `NEXT_PUBLIC_STATIC_FORM_ACTION`
4. `STATIC_FORM_ACTION`

Verification is read from:

```text
STATIC_FORM_ENDPOINT_VERIFIED
```

The required value is exactly:

```text
true
```

## Current Expected Errors

Until the future endpoint is deployed and verified, strict validators should continue to report:

```text
Static form endpoint is not configured for production/static deploy readiness.
Static form endpoint/backend verification is missing; mailbox readiness is not app form readiness.
```

If a placeholder or local URL is configured, validators should report:

```text
Static form endpoint must be a verified HTTPS endpoint, not a local or placeholder URL.
```

## Future Unlock Requirements

To satisfy validators later:

1. Deploy or configure the approved endpoint.
2. Verify the endpoint/backend contract.
3. Set the real public HTTPS endpoint URL:

```text
NEXT_PUBLIC_STATIC_FORM_ENDPOINT=https://<approved-form-endpoint-host>/api/static-contact
```

4. Set:

```text
STATIC_FORM_ENDPOINT_VERIFIED=true
```

5. Rebuild/regenerate static output.
6. Rerun strict validators.

## Commands To Rerun Later

After separate approval:

```powershell
cd apps/ice-rink-web
npm run export:static:ice:cms
npm run validate:snapshot:ice
cd ../..
node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out apps/ice-rink-web/out
node deployment/static-azure/validate-staging-package.mjs --site ice-rink-rentals --folder apps/ice-rink-web/out
```

## Important Distinction

`staticEndpointRef=ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT` is payload routing metadata. It does not satisfy the endpoint URL validator.

The static build must receive a real URL through `NEXT_PUBLIC_STATIC_FORM_ENDPOINT` or one of the supported aliases.

## Current Action

No validator code was changed in this preflight. No env var was set. No static output was rebuilt.
