# Source Password Route Discovery

Status: route missing; repair required.

Source-discovered facts:

- Login route: `POST /api/auth/login`.
- Login payload shape: `{ email, password }`.
- Login verifies `request.Password` with `BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash)`.
- User model stores `PasswordHash` on `pumpkin_net_models.Models.User`.
- Role model is `UserRole` enum with `SuperAdmin`, `TenantAdmin`, `Editor`, and `Viewer`.
- Sanitized user responses omit password and password hash.
- Existing user profile route updates only email/name and explicitly preserves password, role, tenant, and active state.
- `IDatabaseService.UpdateUserAsync` and data connections support updating a user document.

No existing password change or reset route was found in source before repair.

Repair decision:

Implement a minimal SuperAdmin-only self password-rotation route instead of a broad admin reset surface.
