# Synthetic Contact Payload Summary

Approved synthetic payload template:

- Name: `Pumpkin Production Admin Persistence QA`.
- Email domain: `iceskatingrinkrentals.com`.
- Phone pattern: synthetic `555-0100`.
- Event location: `Synthetic Production Admin Persistence QA Test`.
- Message prefix: `Synthetic non-PII production contact Admin persistence verification.`
- Trace ID prefix: `v2-8-32o-production-contact-admin-persistence`.

Execution result:

- Payload submitted: no.
- Trace ID generated for a submitted message: no.
- Production POST count used: `0`.
- Owner personal info submitted: no.

Reason:

The Admin/JWT auth binding blocker fired before login, authenticated readback, and POST.

