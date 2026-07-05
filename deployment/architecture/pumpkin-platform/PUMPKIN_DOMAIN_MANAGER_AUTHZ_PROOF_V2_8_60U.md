# Pumpkin Domain Manager Authz Proof V2.8.60U

Status: passed.

SuperAdmin proof:

- Login succeeded on isolated Admin UI.
- Login succeeded on production Admin UI.
- `Domains` nav entry was visible.
- `/dashboard/onboarding/domains` loaded.
- Ice and Airstrip tenants were visible.
- Airstrip DomainBinding and DNS packet were visible.
- Read-only DNS validation ran.

TenantAdmin proof:

- Airstrip TenantAdmin login succeeded on isolated Admin UI.
- Airstrip TenantAdmin login succeeded on production Admin UI.
- `Domains` nav entry was hidden.
- Direct route `/dashboard/onboarding/domains` showed `Access Restricted`.
- Direct DomainBinding API call returned HTTP 403.

Boundary:

- UI contains no Bluehost DNS mutation control.
- UI contains no enabled Azure custom-domain bind control.
- Future cutover controls are disabled until a later approved phase.
