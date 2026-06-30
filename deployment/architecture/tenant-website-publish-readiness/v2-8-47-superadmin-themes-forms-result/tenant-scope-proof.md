# Tenant Scope Proof

Result: passed.

SuperAdmin proof:

- SuperAdmin could read all current tenants.
- Current tenant count: 1.
- Tenant IDs: `ice-rink-rentals`.
- Page count summary for `ice-rink-rentals`: 3.

TenantAdmin wrong-tenant proof:

- Existing TenantAdmin token attempted a wrong-tenant Theme read.
- Expected status: HTTP 403.
- Actual status: HTTP 403.

Mutation scope:

- Theme lifecycle records used tenant `ice-rink-rentals` only.
- No other tenant content was mutated.
