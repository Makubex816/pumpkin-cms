# Local Validator Result

Local validator reproduction:

- X-shaped payload without Origin: failed.
- X-shaped payload with valid Origin but literal routing values: failed.
- Corrected Y payload with valid Origin and allowlisted routing keys: passed.

Corrected validator output summary:

- `ok`: true.
- Errors: none.
- Resolved domain routing key: `ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT`.
- Resolved recipient group: `ICE_RINK_RENTALS_LEAD_RECIPIENT`.
- Resolved routing mode: `manual_review_then_provider_match`.
- Resolved form ID: `default-quote-request`.
- Resolved form key: `default-quote-request`.

Static-contact compat tests:

- `npm test` passed.
- 9 tests passed.
- 0 tests failed.

Syntax checks:

- `node --check` passed for the validator, handler, and test files used in this phase.
