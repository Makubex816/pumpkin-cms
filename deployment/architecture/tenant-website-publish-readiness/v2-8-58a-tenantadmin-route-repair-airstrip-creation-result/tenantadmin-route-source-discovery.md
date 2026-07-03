# TenantAdmin Route Source Discovery

Source-discovered facts:

- `User` model path: `apps/pumpkin-net-models/Models/User.cs`.
- Roles: `SuperAdmin`, `TenantAdmin`, `Editor`, `Viewer`.
- Existing login uses `GetUserByEmailAsync`, `BCrypt.Net.BCrypt.Verify`, and role claim `user.Role.ToString()`.
- Existing password helper uses `BCrypt.Net.BCrypt.HashPassword`.
- User container/collection name: `User`.
- Tenant partition key: `tenantId`.
- Existing user data methods before repair: `GetUserByEmailAsync`, `UpdateUserLastLoginAsync`.
- Missing before repair: create user/TenantAdmin route and data service create method.

No existing login behavior, role model, container name, or partition key was changed.

