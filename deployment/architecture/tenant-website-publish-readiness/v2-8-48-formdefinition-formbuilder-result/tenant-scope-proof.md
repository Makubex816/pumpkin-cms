# Tenant Scope Proof

Source proof:

- Each Admin FormDefinition route requires authorization.
- Each Admin FormDefinition route enforces `tenantId != userTenantId && userRole != "SuperAdmin"` as forbidden.
- Public FormDefinition read validates the tenant API key against the route tenant before reading.
- Cosmos queries and item operations use tenant-scoped filters and `new PartitionKey(tenantId)`.

Live proof:

- Unauthenticated Admin FormDefinition list returned HTTP `401`.
- Public read succeeded only through the tenant API-key route for `ice-rink-rentals`.
- Lifecycle writes used only tenant `ice-rink-rentals`.

No other-tenant mutation occurred.
