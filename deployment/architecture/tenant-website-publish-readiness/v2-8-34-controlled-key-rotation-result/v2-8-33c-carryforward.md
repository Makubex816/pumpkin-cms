# V2.8.33C Carryforward

V2.8.33C recorded the contact gate as closed from V2.8.33B proof.

Carryforward production trace:

`v2-8-33b-production-static-contact-20260629015903-78f5b35b`

Carryforward production entry ID:

`ice-rink-rentals-default-quote-request-97389127-25ea-4731-8bbe-62f6c59e88b4`

Carryforward evidence:

- Production static-contact POST returned HTTP 200.
- Authenticated Admin FormEntry readback found the trace.
- V2.8.33C performed evidence consolidation only.

V2.8.34 did not invalidate the V2.8.33C carryforward proof, but the key rotation itself did not close because isolated verification failed and rollback was performed.
