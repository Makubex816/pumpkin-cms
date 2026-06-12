# Synthetic Payload Proposal

Status: proposed only; not submitted.

Payload requirements:

- synthetic and non-PII;
- Ice tenant only;
- current static frontend payload shape;
- approved routing refs only;
- consent set to true;
- honeypot empty.

Proposed JSON:

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
    "email": "staging-verification@example.com",
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

This package does not submit the payload.

