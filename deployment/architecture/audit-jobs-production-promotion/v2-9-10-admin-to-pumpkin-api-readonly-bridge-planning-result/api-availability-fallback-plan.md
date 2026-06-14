# API Availability Fallback Plan

Fallback rule:

If `admin-api-readonly` cannot produce a valid read-only Admin snapshot, use the existing `admin-local-fixture-readonly` provider and display a degraded state.

Fallback triggers:

- API base URL unavailable or unset;
- auth/session unavailable;
- network failure;
- timeout;
- status `401` or `403`;
- status `400` for missing tenant/site scope;
- status `500` or `503`;
- envelope contract invalid;
- read-only flag missing or false;
- provider mode unsupported;
- no-write boundary not satisfied;
- expected counts do not match list data;
- Google indexing deferred state missing;
- future action guard validation fails.

Fallback display:

- provider mode: fixture fallback;
- degraded reason: short redacted reason code;
- API request ID and correlation ID when available;
- fixture request/correlation values when fallback is used;
- no mutation controls enabled.

The fallback must not silently erase warnings. It should make API unavailability visible while keeping the current audited fixture view usable.

