# API / Function Source Analysis

Result: source support exists, but not in the deployed static artifact.

Next API route:

- File: `apps/ice-rink-web/src/app/api/contact/route.ts`
- Method: `POST`
- Runtime dependencies:
  - `resolveSiteDefinition`
  - `PUMPKIN_API_URL`
  - server-side tenant/API key env values
- It returns JSON `{ ok: true, entryId }` on successful save.
- It is excluded from static `out` output by Next static export.

Static form endpoint scaffold:

- Folder: `deployment/static-azure/forms/static-form-endpoint/`
- Primary deployable route: `/api/static-contact`
- Methods: `OPTIONS`, `POST`
- Local tests cover dry-run, Pumpkin API forwarding shape, Graph sendMail mocks, CORS preflight, validation, sanitization, and no secret echo.
- The deployable Azure Function scaffold intentionally has no `/api/contact` compatibility route.

Local test server:

- Accepts `/api/static-contact`.
- Accepts `/api/contact` only for local compatibility.
- This compatibility is not registered in the deployable Azure Function wrapper.

Conclusion:

- There is healthy local source for a static form endpoint, but it requires a separate endpoint deployment/linking phase and server-side settings.
- No deployed source in V2.8.21 can make production `/api/contact` work without deploy/config actions.
