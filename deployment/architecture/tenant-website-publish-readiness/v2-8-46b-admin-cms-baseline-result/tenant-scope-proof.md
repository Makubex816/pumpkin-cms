# Tenant Scope Proof

Authenticated user:

- Role: `TenantAdmin`.
- Tenant: `ice-rink-rentals`.

Source controls:

- Admin Page routes reject route tenant mismatch unless caller role is `SuperAdmin`.
- Admin MediaAsset routes reject route tenant mismatch unless caller role is `SuperAdmin`.
- MediaAsset save/update service sets `TenantId` from the route tenant.

Final readback:

- Page rows with non-Ice tenant: `0`.
- MediaAsset rows with non-Ice tenant: `0`.

No other tenant was mutated.
