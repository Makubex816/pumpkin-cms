# JWT Null-Safe Fix Carryforward

Source marker verification confirmed the V2.8.32I fix is present:

- JWT bearer setup captures `Jwt:SecretKey` into `jwtSecretKey`.
- JWT bearer setup checks `string.IsNullOrWhiteSpace(jwtSecretKey)`.
- Missing JWT secret calls `context.NoResult()` instead of throwing.
- Token validation encodes the guarded `jwtSecretKey`.
- Health routes are explicitly anonymous.
- Health routes remain dependency-light.

Nuance:

The login handler still requires JWT config when a login request is made. That is outside J scope and was not exercised. J only verified dependency-light health.

No source implementation changes were made in V2.8.32J.
