# Tenant Isolation Proof

Result: source-supported, live entry proof blocked.

Source-discovered isolation controls:
- Public submit path forwards to `/api/forms/{tenantId}/submit/{type}` with server-side tenant config.
- Pumpkin API sets `formEntry.TenantId = tenantId` in the submit alias path.
- Admin FormEntry list/detail routes compare the requested tenant ID to the authenticated user tenant ID unless the user is SuperAdmin.
- FormEntry readback routes use tenant ID in the route.

Live proof:
- No OS FormEntry was created.
- Cross-tenant leakage was not detected.
- A live entry-level isolation proof remains pending after the missing custom-header readback handoff is supplied.

Ice mutation:
- No Ice form was submitted.
- Ice GET-only runtime routes remained healthy.
