# Payload Contract Diagnosis

Diagnosis:

The V2.8.34 isolated HTTP 400 was consistent with a payload contract mismatch. Source review confirmed the static bridge can preserve upstream Pumpkin API HTTP 400 responses, and Pumpkin API `FormSubmissionGuard` requires a stricter `default-quote-request` form data shape than the simplified V2.8.34 synthetic payload used.

Source-confirmed required `formData` keys:

- `fullName`
- `email`
- `phone`
- `eventCity`
- `eventState`
- `eventDateOrDateRange`
- `eventType`
- `venueSetting`
- `message`
- `consent`

Corrected V2.8.34A payload also included:

- `siteKey`
- `tenantId`
- `formId`
- `formKey`
- `pageSlug`
- `sourcePage`
- `formType`
- `staticEndpointRef`
- `leadRecipientRef`
- empty `honeypot`

Headers used:

- Isolated Origin/Referer: `https://kind-island-0a85a740f.7.azurestaticapps.net`
- Production Origin/Referer: `https://iceskatingrinkrentals.com`
