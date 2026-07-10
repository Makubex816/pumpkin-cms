# Form Submit Source Readiness

Result: partially ready, blocked before live proof.

Source-discovered path:
- The starter `ContactFormBlock` posts to `/api/forms/submit/{formType}` when `previewMode` is false.
- The starter API route forwards to Pumpkin API `/api/forms/{tenantId}/submit/{type}` with a server-side bearer tenant API key.
- Pumpkin API has the submit alias route and FormEntry persistence path.
- Pumpkin API has Admin FormEntry list/detail aliases.
- The deployed Party Pros custom-domain contact page was still preview-disabled before OS source repair.

Local source repair:
- `apps/starter-app/src/lib/host-tenant-routing.ts` now allows a route `formsMode` of `live-submit`.
- The built-in Party Pros host route uses `formsMode: 'live-submit'`.
- `apps/starter-app/src/app/(site)/page.tsx` passes `previewMode={hostTenantPreview.route.formsMode !== 'live-submit'}`.
- `apps/starter-app/src/app/(site)/[...slug]/page.tsx` uses the same gate.

Preview route preservation:
- `/preview/party-pros-philadelphia...` does not use the custom-domain host route gate.
- Preview routes remain explicitly rendered with preview mode enabled.

Validation:
- `npm run type-check` passed.
- `npm run build` passed with the existing shared package `fs` warning.
