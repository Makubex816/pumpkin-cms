# Isolated Staging Validation Plan

This plan is not approved for execution in V2.8.30.

Preconditions:

- Separate approval for implementation/binding.
- Separate isolated staging deployment approval.
- No custom production domains on the isolated target.
- Protected bindings set in the isolated target only.
- Admin readback points to the same Pumpkin API/backend as the isolated contact function.

Validation sequence:

1. Deploy to isolated staging only.
2. Confirm static page wiring on isolated target.
3. Send exactly one no-PII synthetic contact POST only after POST approval.
4. Confirm the contact response returns `200`, `ok:true`, and an entry ID with prefix `ice-rink-rentals-default-quote-request-`.
5. Confirm the Pumpkin API write path created the `FormEntry`.
6. Confirm the Admin Lead Inbox or Admin read endpoint for isolated validation sees the exact entry ID.
7. Record trace ID, entry ID, target, and operator readback result.

Pass condition:

The exact isolated staging entry ID is visible through the Admin `FormEntry` path for tenant `ice-rink-rentals`.

Fail condition:

The contact response succeeds but Admin cannot read the exact `FormEntry`, or the write lands in a backend different from the Admin validation backend.
