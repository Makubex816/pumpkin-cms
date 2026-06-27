# Contact API Acceptance vs Persistence Analysis

Source inspected:

- `deployment/static-azure/forms/static-form-endpoint-compat/contact-handler.mjs`
- `deployment/static-azure/forms/static-form-endpoint-compat/graph-send-mail-delivery.mjs`
- `deployment/static-azure/forms/static-form-endpoint-compat/test-static-form-endpoint-compat.mjs`

Key source points:

- `handleStaticContactRequest` validates the payload and builds an entry before delivery: `contact-handler.mjs:72-113`.
- The success response returns `200`, `ok:true`, and `entryId` from `savedEntry?.id || entry.id`: `contact-handler.mjs:115-119`.
- `deliverStaticFormEntry` chooses between `graph`, `pumpkin-api`, and dry-run: `contact-handler.mjs:173-186`.
- `getDeliveryMode` defaults to `dry-run` unless `FORM_DELIVERY_MODE` or `STATIC_FORM_FORWARD_MODE` says otherwise: `contact-handler.mjs:188-199`.
- The only persistence path in the compat handler is `forwardToPumpkin`, which POSTs to `/api/forms/{tenantId}/entries`: `contact-handler.mjs:205-228`.
- Graph delivery returns `id: entry.id` after Graph `202`, but does not write to Pumpkin API: `graph-send-mail-delivery.mjs:6-37`.
- The local compat test for the accepted response uses `FORM_DELIVERY_MODE: dry-run` and only asserts status 200, `ok:true`, and the entry ID prefix: `test-static-form-endpoint-compat.mjs:8-14`, `118-123`.

Conclusion:

An accepted compat API response is not equivalent to persistence. In dry-run/no-email mode, the handler intentionally returns an accepted response with a generated ID and no store write. In graph mode, the handler can return accepted after Microsoft Graph `sendMail` accepts the message, but it still does not create an Admin-visible `FormEntry`. Only `pumpkin-api` mode writes to Pumpkin API.

