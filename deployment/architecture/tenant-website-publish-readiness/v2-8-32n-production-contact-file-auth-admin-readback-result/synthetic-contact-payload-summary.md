# Synthetic Contact Payload Summary

Approved synthetic payload template:

- Name: `Pumpkin Production Admin Persistence QA`.
- Email domain: `iceskatingrinkrentals.com`.
- Phone pattern: synthetic `555-0100`.
- Event location: `Synthetic Production Admin Persistence QA Test`.
- Message prefix: `Synthetic non-PII production contact Admin persistence verification.`
- Trace ID prefix: `v2-8-32n-production-contact-admin-persistence`.

Execution result:

- Payload submitted: no.
- Reason: Admin FormEntry readback auth preflight returned HTTP `401`.
- Production POST count used: `0`.
- Owner personal info submitted: no.

Because the hard stop fired before POST, no V2.8.32N contact trace ID was submitted to production.

