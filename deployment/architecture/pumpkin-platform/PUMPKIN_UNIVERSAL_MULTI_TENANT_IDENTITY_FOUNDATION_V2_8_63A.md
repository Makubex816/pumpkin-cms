# Pumpkin universal multi-tenant identity foundation V2.8.63A

Pumpkin identity is additive: immutable `userId` identifies a global account; immutable `tenantUid` identifies a tenant; `TenantMembership` is the only authority relating them. A login email authenticates an account but grants no tenant access. Global SuperAdmin is separate from TenantAdmin/Editor/Viewer membership roles. Active tenant context identifies one server-validated membership and never embeds an uncontrolled permanent membership list.

Legacy User/Tenant/content fields remain until migration and compatibility proof. All sensitive writes re-read account status, session version, membership status and role. Account disable, membership revoke, password/email change and administrative sign-out invalidate sessions. Security audit is immutable and secret-free.

63A implementation is disabled by default and introduces no production behavior. 63B owns backed-up additive persistence, backfill, dual read/write activation and runtime proof.
