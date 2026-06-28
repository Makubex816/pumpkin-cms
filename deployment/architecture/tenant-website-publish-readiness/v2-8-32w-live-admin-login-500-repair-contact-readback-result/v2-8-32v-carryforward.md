# V2.8.32V Carryforward

V2.8.32V completed the Admin identity repair:

- `User` container existed or was created with partition key `/tenantId`.
- Exactly one approved Admin identity existed for the approved tenant/email.
- The Admin identity was active, TenantAdmin, tenant-matched, and password-compatible.
- Live Admin login moved past HTTP 401 but returned HTTP 500.
- No bearer token was issued in V2.8.32V.
- No Admin readback and no production contact POST occurred in V2.8.32V.

V2.8.32V identified the next likely source-backed blocker:

- `Program.cs` parses `Jwt:ExpirationMinutes`.
- `Program.cs` uses `Jwt:Issuer` and `Jwt:Audience` while minting and validating JWTs.
- V2.8.32T redacted config evidence showed `Jwt__Issuer`, `Jwt__Audience`, and `Jwt__ExpirationMinutes` were absent.

V2.8.32W continued from that blocker.
