# Admin Auth Source Discovery

Source discovery result: succeeded.

Files inspected:

- `apps/pumpkin-api/Program.cs`
- `apps/admin/src/lib/api.ts`

JWT configuration source:

- `Program.cs:81` reads `builder.Configuration.GetSection("Jwt")`.
- `Program.cs:82` reads `jwtSettings["SecretKey"]`.
- `Program.cs:97-106` uses that key as the JWT signing key for bearer token validation.
- `Program.cs:407-409` reads `Jwt:SecretKey` again for login token signing.

Source-discovered Admin/JWT app setting:

- Config key: `Jwt:SecretKey`.
- Azure App Service environment/app-setting name: `Jwt__SecretKey`.

Additional JWT values referenced by source:

- `Jwt:Issuer`.
- `Jwt:Audience`.
- `Jwt:ExpirationMinutes`.

Those additional values were discovered as source references only. They were not listed from Azure and were not mutated.

Login route discovery:

- `Program.cs:388` maps `POST /api/auth/login`.
- `apps/admin/src/lib/api.ts:112-117` sends `{ email, password }` to `/api/auth/login`.
- `Program.cs:438-452` returns a login response containing a token and user information.

Admin FormEntry readback auth discovery:

- `apps/admin/src/lib/api.ts:402-410` calls `/api/admin/{tenantId}/form-entries` with `Authorization: Bearer <token>`.

