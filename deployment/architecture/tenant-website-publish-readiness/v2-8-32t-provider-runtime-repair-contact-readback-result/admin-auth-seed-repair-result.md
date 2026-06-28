# Admin Auth Seed Repair Result

Status: not performed.

Reason:

Source inspection did not find a live Admin seed/repair endpoint or service method exposed through the API. The live auth source only supports:

- lookup user by email,
- reject if missing or inactive,
- verify BCrypt password hash,
- issue JWT after those checks pass.

Since the source-discovered repair path does not exist, V2.8.32T stopped after HTTP 401 and did not mutate Admin user data.

Blocker:

`admin_login_unauthorized_after_provider_binding`

