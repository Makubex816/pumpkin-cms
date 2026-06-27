# Remediation Implementation Design

## Selected Design

Keep the existing public static contact contract:

`/contact` -> `/api/static-contact`

Change the delivery path behind the compat function so accepted submissions are persisted through Pumpkin API:

`/api/static-contact` -> `POST /api/forms/ice-rink-rentals/entries` -> Pumpkin `FormEntry` store -> Admin Lead Inbox.

## Why This Design

- The static site already posts to `/api/static-contact`.
- The compat function already has a `pumpkin-api` forwarding path.
- Pumpkin API already exposes the `POST /api/forms/{tenantId}/entries` write endpoint.
- Admin already reads the resulting `FormEntry` records.
- This is narrower than moving the contact API into Pumpkin API or teaching Admin to read a separate static-function/provider store.

## V2.8.31 Implementation Tasks

1. Add a local mocked-fetch test for `FORM_DELIVERY_MODE=pumpkin-api`.
2. Assert the compat function posts to `/api/forms/ice-rink-rentals/entries`.
3. Assert the outbound payload includes tenant `ice-rink-rentals`, form ID `default-quote-request`, source `static-form-endpoint`, and expected routing refs.
4. Assert the outbound request includes an authorization header without printing its value.
5. Document exact app-setting names for the separately approved binding phase.
6. Do not deploy or send a live POST until those phases are separately approved.

## Idempotency And Failure Behavior For Later

The current compat function builds a unique ID per submission. If Pumpkin API returns non-2xx, the public request returns a failure response. For future dual delivery, Admin persistence should be the primary required write, and email notification should not mask a persistence failure.
