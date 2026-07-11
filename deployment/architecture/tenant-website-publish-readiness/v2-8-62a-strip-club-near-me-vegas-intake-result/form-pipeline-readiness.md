# Form Pipeline Readiness

Current source behavior is not production-ready.

- pages with forms: 38;
- total forms: 65;
- GET/default-GET forms: 65;
- forms intercepted into browser local storage: 29;
- remaining GET navigation forms: 36;
- hidden fields: 14;
- consent fields: 0;
- honeypot fields: 0;
- package emails: 0;
- backend form endpoint: none.

The primary contact form collects required name, phone, and pickup location plus optional group size, venue choice, timing, pickup time, request intent, and notes. Guide forms use subsets of those fields and sometimes hidden guide/venue context.

Readiness gaps:

- PII must not remain in browser local storage as the lead system of record.
- GET forms must not place names, phone numbers, pickup locations, or notes into URLs.
- One Pumpkin FormDefinition must normalize field names and preserve source/guide/venue context safely.
- Owner-approved privacy/consent language is required.
- A honeypot and normal Pumpkin anti-abuse controls are required.
- The owner must supply or approve the form notification recipient; the TenantAdmin email is not automatically the customer inquiry recipient.
- The external Airstrip packages URL is an outbound link, not a tenant form endpoint.

Proposed local-only form key for the next compiler proof: `strip-club-near-me-vegas-reservation-request`. This is a draft identifier, not a created FormDefinition.

V2.8.62A sent no POST, created no FormEntry, and used no authentication secret.
