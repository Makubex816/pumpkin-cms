# Function Wrapper Result

Generated: 2026-06-05

## Wrapper Files

```text
deployment/static-azure/forms/static-form-endpoint/azure-function-adapter.mjs
deployment/static-azure/forms/static-form-endpoint/azure-function-static-contact.mjs
deployment/static-azure/forms/static-form-endpoint/host.json
```

## Adapter Responsibilities

`azure-function-adapter.mjs`:

- exports route constants for local tests and docs
- adapts Azure Functions request headers/body to the hardened handler
- returns Azure Functions-compatible `{ status, headers, jsonBody }`
- preserves `OPTIONS` preflight handling
- delegates all validation, sanitization, routing, and forwarding behavior to `contact-handler.mjs`

## Entrypoint Responsibilities

`azure-function-static-contact.mjs`:

- imports `app` from `@azure/functions`
- registers the `static-contact` function
- uses the shared adapter route options
- exposes `route: 'static-contact'`

## Host Metadata

`host.json` sets:

```json
{
  "version": "2.0",
  "extensions": {
    "http": {
      "routePrefix": "api"
    }
  }
}
```

That keeps the route contract aligned to `/api/static-contact`.

## Package Metadata

`package.json` now includes:

```text
main=azure-function-static-contact.mjs
dependency=@azure/functions
```

Scripts now check and test the Function adapter/wrapper coverage.

## Safety

No secrets are embedded in source files. `local.settings.sample.json` contains placeholders only. A real `local.settings.json` remains excluded by `.funcignore` and must not be committed.
