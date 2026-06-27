# Risk And Open Decisions

Residual risks:

- The local mocked test proves payload shape and failure behavior, but not live storage.
- The later binding phase must ensure `PUMPKIN_API_URL` points to the same backend/provider Admin reads.
- The later binding phase must inject `PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY` without printing or exposing the value.
- The static function must be deployed after bindings are present before any POST validation.

Open decisions:

- Whether to remove the legacy `ICE_RINK_RENTALS_API_KEY` fallback after the new protected binding is proven.
- Whether dual delivery should be implemented after Admin persistence is proven.
- Whether future production POST retry should include an operator-visible trace field in addition to the returned entry ID.

