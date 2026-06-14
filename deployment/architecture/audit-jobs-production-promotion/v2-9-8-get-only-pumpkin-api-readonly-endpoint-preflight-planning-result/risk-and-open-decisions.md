# Risk And Open Decisions

Risks:

- Future API implementation must avoid accidentally coupling to existing write-capable Pumpkin API services.
- Current Admin adapter allow-list does not yet include `future-pumpkin-api-readonly`; that should be changed only during the approved implementation phase with tests.
- Fixture-backed behavior does not prove future provider-backed performance, tenant partitioning, or authorization against real identity tokens.
- Existing API tests include older utilities that can generate credentials if run without phase-specific arguments; future Audit Jobs tests should use a dedicated runner and avoid those paths.

Open decisions:

- exact class/file names for the future Audit Jobs API folder;
- whether route-specific endpoints return sliced data only or a full envelope plus `data.items`;
- whether `viewer-summary` should return the full shared viewer model or a compact summary with panel metadata;
- future provider source after fixture-backed implementation;
- whether SuperAdmin cross-tenant reads are needed for Audit Jobs at all;
- whether Admin keeps fixture fallback after API route adoption.

