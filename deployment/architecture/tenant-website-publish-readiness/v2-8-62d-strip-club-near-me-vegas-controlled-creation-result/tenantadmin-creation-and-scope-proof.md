# TenantAdmin Creation And Scope Proof

Status: `blocked_http_409_global_email_uniqueness_conflict`.

- Requested email: `steviedog2002@gmail.com`
- Creation response: HTTP 409
- Source-supported rule: `TenantAdminUserProvisioningService` calls `GetUserByEmailAsync` and rejects any normalized email already present anywhere on the platform.
- Existing assignment: active `TenantAdmin` for `airstrip-club-las-vegas`
- Target-tenant user count after stop: 0
- Alternate email guessed: no
- Retry attempted: no
- Airstrip account changed or reused: no
- TenantAdmin login/scope proof: not run because no account was created

The owner must approve a unique email or separately approve a platform identity change. Existing Airstrip identity must remain untouched unless explicitly approved.
