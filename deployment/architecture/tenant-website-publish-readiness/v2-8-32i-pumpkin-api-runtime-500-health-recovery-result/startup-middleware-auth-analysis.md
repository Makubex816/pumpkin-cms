# Startup Middleware Auth Analysis

Initial I hypothesis:

- Health routes were dependency-light, but global auth middleware ran before endpoints.
- Missing `Jwt:SecretKey` could throw before health responses.

I first routed health requests around an explicit `UseWhen` auth branch and marked health routes anonymous. That source change was deployed once, but live health still returned HTTP `500`.

Post-deploy local reproduction showed why: authentication middleware was still invoked for health requests and attempted to initialize JWT bearer options. The null secret was encoded directly:

`System.Text.Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!)`

Final local fix:

- Capture `Jwt:SecretKey` once into `jwtSecretKey`.
- If it is missing or whitespace, return `context.NoResult()` from `JwtBearerEvents.OnMessageReceived`.
- Do not encode a null secret.
- Continue to encode and validate the guarded secret key when present.

Effect:

- Health can return without protected JWT config.
- Protected routes remain unavailable without a valid JWT.
- No provider/contact secret binding is required for health.
