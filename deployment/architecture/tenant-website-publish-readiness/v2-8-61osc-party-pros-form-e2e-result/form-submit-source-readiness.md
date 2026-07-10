# Form Submit Source Readiness

Result: source-ready, live auth blocked.

Source discovery:

- Browser contact/form blocks call the starter route `/api/forms/submit/[type]`.
- Starter route loads tenant config from environment/local config.
- In production, environment configuration is required.
- Starter route forwards to Pumpkin API at `/api/forms/{tenantId}/submit/{type}`.
- Forwarded API request uses `Authorization: Bearer <tenant API key>`.
- Pumpkin API extracts the Bearer key and validates it against the Tenant record `apiKeyHash`.
- Non-default Party Pros forms are validated against the active/published `FormDefinition`.
- Admin FormEntry readback uses JWT-authenticated Admin API routes.

Required live-submit starter settings:

- `PUMPKIN_TENANT_ID`
- `PUMPKIN_API_KEY`
- `PUMPKIN_API_URL` or `NEXT_PUBLIC_PUMPKIN_API_URL`
- `PUMPKIN_HOST_TENANT_ROUTES_JSON` to override the OSB disabled built-in custom-host route with `formsMode: "live-submit"`.

Blocking result:

- The corrected Party Pros submit key is not accepted by the live API.
- No authenticated Admin API path is available to set a matching accepted Party Pros key.
- Therefore OSC stopped before setting starter appsettings.
