# Risk And Open Decisions

## Risks

- The static compat function can be set to `pumpkin-api`, but if `PUMPKIN_API_URL` points to a different backend than Admin reads, Admin visibility will still fail.
- The required Ice tenant API key is protected and was not inspected in this phase.
- Existing local compat tests cover dry-run acceptance but not mocked `pumpkin-api` forwarding.
- Production evidence from V2.8.26 cannot be reused as Admin persistence proof because it was accepted without confirmed persistence.
- Dual delivery can introduce partial-failure behavior if email succeeds but Admin persistence fails.

## Decisions Made

- Admin persistence is required.
- Email-only is not acceptable for closing the Admin visibility gate.
- Dual delivery remains future-optional.
- The next implementation should use the existing compat-to-Pumpkin API write path, not a separate Admin read store.

## Open Decisions For Later

- Exact target value for `PUMPKIN_API_URL`.
- Exact protected value for `ICE_RINK_RENTALS_API_KEY`.
- Whether V2.8.31 is source-test-only or also an approved binding/deployment phase.
- Whether email notification should be added after Admin persistence is proven.
