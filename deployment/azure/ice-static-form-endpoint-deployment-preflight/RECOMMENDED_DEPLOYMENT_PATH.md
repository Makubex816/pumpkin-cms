# Recommended Deployment Path

Generated: 2026-06-05

## Recommendation

Use Option A: a standalone Azure Function companion endpoint using the hardened package in:

```text
deployment/static-azure/forms/static-form-endpoint/
```

Initial scope:

```text
Site: ice-rink-rentals
Tenant: ice-rink-rentals
Allowed site keys: ice-rink-rentals
Roller: paused
Email: disabled unless separately approved
```

## Target

Recommended staging target placeholder from existing static staging docs:

```text
Function App: func-pumpkin-static-forms-staging
Resource group: <approved staging resource group, existing docs use rg-pumpkin-static-staging as a placeholder>
Public route: /api/static-contact
Public URL: https://<approved-form-endpoint-host>/api/static-contact
```

Future production target should be separately approved:

```text
Function App: func-pumpkin-static-forms-prod
Public route: /api/static-contact
Public URL: https://<approved-production-form-endpoint-host>/api/static-contact
```

No Azure CLI discovery was needed for this docs-only pass, and no Azure state was read or changed.

## Route Decision

Preferred public route:

```text
/api/static-contact
```

The package wrapper currently registers:

```text
app name: static-contact
route: contact
```

That produces:

```text
/api/contact
```

Before a future deployment, choose one:

- update the wrapper route to `static-contact` during the separately approved deployment work
- or intentionally deploy the compatibility route `/api/contact` and set `NEXT_PUBLIC_STATIC_FORM_ENDPOINT` to that exact URL

The clearer route for static hosting is `/api/static-contact`.

## Future Execution Sequence

After explicit deployment approval:

1. Confirm the Function App target and route.
2. Create or select the Azure Function project scaffold.
3. Use the hardened handler and package-local Azure Function wrapper, not the older top-level example.
4. Restrict runtime scope to `ice-rink-rentals`.
5. Configure endpoint app settings in approved secret storage.
6. Run package checks locally.
7. Deploy the endpoint.
8. Verify `OPTIONS` and invalid-request behavior.
9. Verify no-email valid POST behavior first with approved test-only data.
10. Verify Pumpkin API `FormEntry` persistence if `pumpkin-api` forwarding is approved.
11. Confirm no secrets appear in public responses, logs, or static output.
12. Only then configure the static build endpoint URL and `STATIC_FORM_ENDPOINT_VERIFIED=true`.
13. Rebuild and rerun strict validators under separate static build/deploy approval.

## Readiness Impact

This preflight does not change production readiness.

Contact form production readiness remains `no`.

Static output quality gates remain `no` until a deployed HTTPS endpoint is verified and validators are rerun with `STATIC_FORM_ENDPOINT_VERIFIED=true`.
