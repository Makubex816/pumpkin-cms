# Known Limitations

Phase 2H-8 limitations:

- Local/offline service foundation only.
- No production Pumpkin API route wiring.
- No Admin UI route or component wiring.
- No database migration or Cosmos provider implementation.
- Local role and tenant guards are simulations.
- Write-action methods are guard stubs and always blocked.
- Pagination is page/pageSize based.
- Response models are local JS contracts, not shared Pumpkin API DTOs yet.
- No live-readonly provider mode.
- No external link crawling or live link health checks.
- No production renderer integration.

These limitations are intentional for this phase.

