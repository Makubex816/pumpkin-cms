# Known Limitations

Phase 2H-9 limitations:

- Fake/local read-only provider only.
- No production database provider.
- No live-readonly inventory provider.
- No Admin UI screens.
- No write actions.
- No production renderer integration.
- Tests call handlers and services directly rather than starting a live server.
- Endpoint foundation depends on existing JWT claims and does not change token issuance.

These limitations are intentional for this safe GET-only foundation.

