# Tenant And Role Guard Result

Write-action guards enforce:

- tenant key presence
- site key presence
- tenant mismatch denial
- actor identity presence
- role allow/deny rules
- reason capture
- approval reference for scoped write actions
- bulk approval requirements
- provider-mode gates

Viewer and tenant-mismatch requests are blocked in tests. Operator scope is limited, and TenantAdmin requests must match the tenant.
