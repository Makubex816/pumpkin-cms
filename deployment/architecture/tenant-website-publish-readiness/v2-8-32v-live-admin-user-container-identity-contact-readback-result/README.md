# V2.8.32V Live Admin User Container Identity Contact Readback Result

Phase status: blocked after Admin identity repair, before Admin readback and before production contact POST.

Classification: `admin_login_failed_http_500_after_identity_repair`.

V2.8.32V used the completed V2.8.32U result and the approved ignored secure file `.tmp/v2-8-32v/secure/live-admin-user-container-identity-repair.json`.

Completed:

- Confirmed secure-file schema matches source-discovered Admin identity schema.
- Built an ignored helper under `.tmp/v2-8-32v/admin-user-container-helper/`.
- Created or confirmed the source-required `User` Cosmos container with partition key `/tenantId`.
- Confirmed exactly one approved Admin identity exists for the approved email and tenant.
- Confirmed the Admin identity is active, TenantAdmin, tenant-matched, and password-compatible with the approved desired password.
- Attempted live Admin login.

Blocked:

- Live Admin login returned HTTP 500 after identity repair.
- No bearer token was issued.
- Admin FormEntry readback preflight did not run.
- No production contact POST was sent.

Likely source-backed next blocker:

- `Program.cs` parses `Jwt:ExpirationMinutes` and uses `Jwt:Issuer` / `Jwt:Audience` after password verification.
- V2.8.32T redacted appsetting verification showed `Jwt__ExpirationMinutes`, `Jwt__Issuer`, and `Jwt__Audience` were absent.
- V2.8.32V was not an appsetting phase, so it stopped before any JWT appsetting mutation.

Contact gate status: open.

