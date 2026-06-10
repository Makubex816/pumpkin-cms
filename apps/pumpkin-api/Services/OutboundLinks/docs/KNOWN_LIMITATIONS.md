# Known Limitations

Phase 2H-9 limitations:

- Fake/local read-only provider only.
- No production database provider wiring.
- No database migration.
- No Admin UI implementation.
- No production renderer integration.
- No live-readonly inventory provider.
- No external link crawling or live link health checks.
- No write endpoints.
- Authorization gate is read-only and scoped to existing JWT claims.
- API tests call handlers/services directly rather than starting a live server.

These are intentional limitations for the safe GET-only endpoint foundation.

