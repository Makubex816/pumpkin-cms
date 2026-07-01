# External Route Compatibility Implementation

## Public Submit Alias

Route:

`POST /api/forms/{tenantId}/submit/{type}`

Behavior:

- accepts flat JSON payloads or wrapper payloads with `formId` and `formData`
- extracts tenant API key from `Authorization: Bearer ...`
- normalizes contact/quote aliases to the existing default submit path
- requires non-default dynamic types to resolve an active/published `FormDefinition`
- saves through the existing `FormEntry` persistence path

## Admin Aliases

Routes:

- `GET /api/admin/forms/{tenantId}/entries`
- `GET /api/admin/forms/{tenantId}/entries/{entryId}`

Behavior:

- require JWT authentication
- enforce tenant match unless the caller is `SuperAdmin`
- use existing tenant-scoped FormEntry reads
- support optional list filtering by `type`
