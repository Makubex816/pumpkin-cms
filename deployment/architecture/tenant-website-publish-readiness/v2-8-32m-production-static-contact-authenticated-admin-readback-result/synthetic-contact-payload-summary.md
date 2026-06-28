# Synthetic Contact Payload Summary

The synthetic non-PII production contact payload was prepared from approved env values, but it was not posted.

Public-safe payload summary:

- Name: synthetic QA name.
- Email: expected public contact email.
- Phone: synthetic `555` test number.
- Event location: synthetic QA location.
- Message: synthetic Admin persistence verification message.
- Trace ID included in message: `v2-8-32m-production-contact-admin-persistence-20260627213404`.
- Expected tenant ID: `ice-rink-rentals`.
- Expected form ID: `default-quote-request`.

Execution result: blocked before POST because authenticated Admin readback could not be constructed.
