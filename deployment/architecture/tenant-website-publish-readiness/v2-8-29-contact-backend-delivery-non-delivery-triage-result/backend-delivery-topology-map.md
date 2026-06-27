# Backend Delivery Topology Map

## Static Production Path Proven By V2.8.26

1. Public static page renders in static mode.
2. `PageRenderer` chooses the static endpoint when `renderMode === static`: `apps/ice-rink-web/src/components/PageRenderer.tsx:39-47`.
3. `getStaticFormEndpoint` defaults Ice static mode to `/api/static-contact`: `apps/ice-rink-web/src/lib/render-mode.ts:33-47`.
4. The Static Web Apps managed API route invokes `deployment/static-azure/forms/static-form-endpoint-compat/static-contact/index.js`.
5. Compat handler validates, builds a local entry, selects delivery mode, and returns a response.

## Delivery Mode Outcomes

| Mode | Trigger | Result | Admin visibility |
| --- | --- | --- | --- |
| `dry-run` / `no-email` | default, `FORM_DELIVERY_MODE=dry-run`, `FORM_DELIVERY_MODE=no-email`, or no recognized mode | returns generated `entry.id`, no external persistence | not visible |
| `graph` / `m365-graph` | `FORM_DELIVERY_MODE=graph` or legacy graph mode | Microsoft Graph `sendMail`, returns generated `entry.id` after Graph 202 | not visible unless separately written |
| `pumpkin-api` | `FORM_DELIVERY_MODE=pumpkin-api` or `STATIC_FORM_FORWARD_MODE=pumpkin-api` | POSTs to Pumpkin API `/api/forms/{tenantId}/entries` with tenant API key | visible if same backend/provider Admin reads |

## Admin Source Of Truth

Admin `/dashboard/forms` reads:

`Admin UI -> apiClient.getFormEntries -> Pumpkin API /api/admin/{tenantId}/form-entries -> FormEntry store`

It does not read:

- Static Web Apps managed function memory.
- Microsoft Graph mailbox.
- Email provider delivery records.
- Function logs.
- Dry-run response IDs.

