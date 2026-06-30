# Static Contact Source Analysis

Reviewed source:

- `deployment/static-azure/forms/static-form-endpoint-compat/static-contact-health/index.js`
- `deployment/static-azure/forms/static-form-endpoint-compat/static-contact-health/function.json`
- `deployment/static-azure/forms/static-form-endpoint-compat/static-contact/index.js`
- `deployment/static-azure/forms/static-form-endpoint-compat/contact-handler.mjs`
- `deployment/static-azure/forms/static-form-endpoint-compat/validate-static-form-payload.mjs`
- `deployment/static-azure/forms/static-form-endpoint-compat/sanitize-static-form-payload.mjs`
- `deployment/static-azure/forms/static-form-endpoint-compat/graph-send-mail-delivery.mjs`
- `deployment/static-azure/scripts/ice-isolated-swa-deploy-readiness.mjs`

Findings:

- The health function is an anonymous GET route registered by `function.json`.
- The health function returns a static HTTP 200 JSON sentinel.
- The health function does not read appsettings or secrets.
- The health function does not call Pumpkin API, Cosmos, Graph, or storage.
- The POST delivery path uses source-discovered static-contact settings, but the failing health route does not.
- A missing API route also returned the same SWA `Backend call failure`, proving the managed API backend is unavailable before route logic can run.

No source bug was proven in the handler code during this phase.

