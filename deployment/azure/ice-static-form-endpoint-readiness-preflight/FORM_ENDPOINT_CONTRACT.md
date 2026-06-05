# Form Endpoint Contract

## Method And Path

Required methods:

- `OPTIONS` for CORS preflight
- `POST` for form submissions

Recommended future URL:

```text
https://<approved-form-endpoint-host>/api/static-contact
```

Compatibility URL:

```text
https://<approved-form-endpoint-host>/api/contact
```

## Request Headers

Required:

- `Content-Type: application/json`
- browser `Origin`

The endpoint must reject unapproved origins.

## Request Payload

Expected top-level fields from the current static frontend:

```json
{
  "siteKey": "ice-rink-rentals",
  "tenantId": "ice-rink-rentals",
  "formId": "default-quote-request",
  "formKey": "default-quote-request",
  "pageSlug": "contact",
  "sourcePage": "/contact",
  "formType": "quote-request",
  "staticEndpointRef": "ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT",
  "leadRecipientRef": "ICE_RINK_RENTALS_LEAD_RECIPIENT",
  "formData": {
    "fullName": "<submitted name>",
    "email": "<submitted email>",
    "phone": "<submitted phone>",
    "eventCity": "<submitted city>",
    "eventState": "<submitted state>",
    "eventDateOrDateRange": "<submitted date/range>",
    "eventType": "<submitted event type>",
    "venueSetting": "<submitted venue setting>",
    "estimatedAttendance": "<submitted attendance>",
    "message": "<submitted message>",
    "consent": "true",
    "honeypot": ""
  }
}
```

Future execution should confirm the endpoint preserves `staticEndpointRef` and `leadRecipientRef` metadata, either by reading those names directly or mapping them to the existing `domainRoutingKey` and `recipientGroup` fields.

## Validation Requirements

- method is `POST`
- body is JSON object
- body size is within the approved limit, currently planned as `20000` bytes
- `siteKey` and `tenantId` resolve to Ice
- `formKey` is expected, currently `default-quote-request`
- page/source fields are expected
- required quote fields exist
- email shape is valid
- consent is truthy
- honeypot fields are empty
- origin is approved

## Sanitization Requirements

- strip control characters
- strip angle brackets from string values
- trim and length-limit values
- sanitize field keys
- reject or ignore unexpected nested objects
- avoid echoing raw user input in public responses

## Response Shape

Success:

```json
{
  "ok": true,
  "message": "Your request was submitted.",
  "entryId": "<saved-entry-id>"
}
```

Validation error:

```json
{
  "ok": false,
  "message": "Please check the highlighted form fields.",
  "validationErrors": ["<safe validation message>"]
}
```

Backend error:

```json
{
  "ok": false,
  "message": "Unable to submit this request right now."
}
```

## Logging Boundaries

Do not log or expose:

- API keys
- bearer tokens
- connection strings
- email provider credentials
- full raw request headers
- unnecessary PII

Log enough to verify routing, status, and failures safely.

