# Static Contact Source Readiness

Source inspected:

- `deployment/static-azure/forms/static-form-endpoint-compat/contact-handler.mjs`
- `deployment/static-azure/forms/static-form-endpoint-compat/static-contact/index.js`
- `deployment/static-azure/forms/static-form-endpoint-compat/static-contact-health/index.js`
- `deployment/static-azure/forms/static-form-endpoint-compat/validate-static-form-payload.mjs`
- `deployment/static-azure/forms/static-form-endpoint-compat/host.json`

Readiness result: passed.

Evidence:

- `/api/static-contact` is registered through `static-contact/function.json`.
- `/api/static-contact-health` is registered through `static-contact-health/function.json`.
- Health returns a public sentinel with `ok: true`, `service: static-contact`, and `contactRoute: /api/static-contact`.
- `FORM_DELIVERY_MODE` supports `pumpkin-api`.
- Pumpkin API forwarding requires `PUMPKIN_API_URL`, a protected key env var name, and the tenant write route.
- The source uses a bearer header to forward to Pumpkin API.
- Upstream non-OK responses are intentionally collapsed to public HTTP 502.

No source code edit was required in V2.8.33A.
