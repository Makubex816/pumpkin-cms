# Owner Static Web Apps and shared API architecture decision

Ratified for INT-10:

- Public tenant runtime: Azure Static Web Apps.
- Public tenant artifact: static at rest and tenant-scoped.
- API model: one logical shared tenant-aware Pumpkin API, not one API deployment per tenant.
- Admin/editor model: platform-dynamic capabilities remain outside the tenant public static artifact.
- Tenant variation: data/configuration only, not source forks or per-tenant locks.
- Capacity: no SKU, worker, load-test, restart, slot, or deployment mutation in this superpass.

This decision is implemented first as a local architecture and build foundation. Any Azure, DNS, domain, TLS, form-persistence, or deployment mutation is reserved for a separately approved controlled pilot.
