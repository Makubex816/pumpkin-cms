# Production Provider State Verification Plan

Plan ID: `olprodstate_2h25_preflight`.

Future read-only verification requirements:

- provider profile ID matches the production approval manifest
- provider mode is the approved production execution/readback mode
- target resource group/scope matches Resource Registry production binding
- account/host and database/namespace match the approved worksheet
- containers exist for all 10 OLM entity groups
- partition key is `/tenantKey`
- auth/session uses approved RBAC or identity mode without keys, connection strings, SAS, or secret output

Phase 2H-25 did not run live production metadata checks because an approved production target/session is not available.
