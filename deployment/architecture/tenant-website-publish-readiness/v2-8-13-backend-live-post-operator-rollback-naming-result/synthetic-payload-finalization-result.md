# Synthetic Payload Finalization Result

Status: finalized and submitted once.

The final payload used synthetic non-PII values and the reserved/non-deliverable email domain `example.invalid`.

Safe payload shape:

```json
{
  "siteKey": "ice-rink-rentals",
  "tenantId": "ice-rink-rentals",
  "formId": "contact",
  "formKey": "contact",
  "pageSlug": "contact",
  "sourcePage": "contact",
  "staticEndpointRef": "ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT",
  "leadRecipientRef": "ICE_RINK_RENTALS_LEAD_RECIPIENT",
  "formData": {
    "name": "PumpkinCMS Staging Verification",
    "email": "staging-verification@example.invalid",
    "phone": "555-0100",
    "event-date": "Winter 2026 staging test",
    "event-location": "Test City, NY - staging venue",
    "venue-type": "Staging test venue",
    "estimated-attendance": "25",
    "surface-details": "Synthetic staging verification only.",
    "rental-goals": "Verify static form endpoint handling with non-PII test content.",
    "consent": "true",
    "honeypot": ""
  }
}
```

No real customer data, auth header, secret, token, cookie, connection string, or protected config value was used.

