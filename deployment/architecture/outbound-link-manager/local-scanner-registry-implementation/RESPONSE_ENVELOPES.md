# Response Envelopes

Every local API-style service returns the same envelope shape:

- `ok`
- `status`
- `code`
- `message`
- `data`
- `errors`
- `meta`
- `tenantKey`
- `siteKey`
- `requestId`

Success envelopes use:

- `ok: true`
- `status: 200`
- `code: OK`
- `errors: []`

Error envelopes use:

- `ok: false`
- `status` of `400`, `403`, `404`, or `500`
- a stable outbound link error code
- a non-empty `errors` array

Metadata includes local-only boundaries where relevant:

- `mode: local-offline`
- `localOnly: true`
- `externalHttpCrawling: false`
- `cmsApiCalls: false`
- `cmsWrites: false`
- `protectedConfigReads: false`

