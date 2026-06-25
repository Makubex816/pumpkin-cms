# Contact Endpoint Definition Result

Result: endpoint definitions identified.

Runtime definition:

- Source file: `apps/ice-rink-web/src/app/api/contact/route.ts`
- Route: `/api/contact`
- Method: `POST`
- Runtime: Next.js App Router API route.
- Purpose: accept contact payloads, create FormEntry data, and forward to Pumpkin API with server-side configuration.

Static frontend definition:

- Source files:
  - `apps/ice-rink-web/src/lib/render-mode.ts`
  - `apps/ice-rink-web/src/components/PageRenderer.tsx`
- Static endpoint env values:
  - `NEXT_PUBLIC_STATIC_FORM_ENDPOINT`
  - `STATIC_FORM_ENDPOINT`
  - `NEXT_PUBLIC_STATIC_FORM_ACTION`
  - `STATIC_FORM_ACTION`
- Static behavior:
  - If configured, the browser posts to the configured public endpoint.
  - If not configured, the form throws a user-facing inline error and does not pretend success.

Static function definition:

- Source folder: `deployment/static-azure/forms/static-form-endpoint/`
- Function name: `static-contact`
- Public path: `/api/static-contact`
- Methods: `OPTIONS`, `POST`
- Deployed `/api/contact` compatibility route: not registered.

Conclusion:

- `/api/contact` is a runtime Next route, not the static endpoint for the selected production artifact.
- The selected production artifact did not configure a public static endpoint.
