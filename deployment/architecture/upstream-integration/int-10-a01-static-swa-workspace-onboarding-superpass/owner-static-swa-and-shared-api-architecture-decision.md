# Owner Static Web Apps and shared API architecture decision

Ratified:

- Public tenant runtime is Azure Static Web Apps.
- Public tenant artifact is static at rest.
- Tenants use one logical shared tenant-aware Pumpkin API.
- Admin and visual editor remain dynamic platform capabilities and are excluded from tenant public static artifacts.
- Tenant differences live in data/configuration, not source forks or per-tenant lockfiles.
- No capacity mutation is authorized by INT-10.
