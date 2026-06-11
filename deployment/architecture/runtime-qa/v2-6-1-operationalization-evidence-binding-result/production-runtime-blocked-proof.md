# Production Runtime Blocked Proof

Status: passed.

The V2.6.1 registry and evidence validator require `production-runtime` to be present and blocked.

Validated sources:

- Runtime QA registry provider modes.
- V2.5.1 operational binding fixture.
- V2.5.1 production-runtime blocked proof.

The evidence validator fails if the environment mode is `production-runtime` or if the production provider profile is not blocked.
