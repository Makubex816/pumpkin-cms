# Form Submit Source Readiness

Result: source-ready, live setup blocked by missing secret handoff values.

Source-discovered submit path:
- Starter `ContactFormBlock` posts to `/api/forms/submit/{formType}` when `previewMode` is false.
- Starter `PageRenderer` formBlock submit path also posts to `/api/forms/submit/{formType}`.
- Starter API route forwards to Pumpkin API `/api/forms/{tenantId}/submit/{type}`.
- The forwarder uses server-side tenant config from `loadTenantConfig`.
- `loadTenantConfig` requires `PUMPKIN_TENANT_ID`, `PUMPKIN_API_URL` or `NEXT_PUBLIC_PUMPKIN_API_URL`, and `PUMPKIN_API_KEY`.
- Pumpkin API has the submit alias route and FormEntry persistence path.
- Pumpkin API has Admin FormEntry list/detail routes.
- Admin UI has Forms inbox source support.

Readback auth source discovery:
- No application source references `PUMPKIN_FORMENTRY_READBACK_AUTH_MODE`, `PUMPKIN_FORMENTRY_READBACK_AUTH_HEADER_NAME`, or `PUMPKIN_FORMENTRY_READBACK_AUTH_VALUE`.
- These variables remain operator-side proof inputs for constructing the Admin readback request, not runtime app requirements.

Email safety source discovery:
- The discovered submit path persists FormEntry data.
- No send-mail provider implementation was exercised or required for this proof.
- OSR still stopped before submit because readback and submit key material were incomplete.
