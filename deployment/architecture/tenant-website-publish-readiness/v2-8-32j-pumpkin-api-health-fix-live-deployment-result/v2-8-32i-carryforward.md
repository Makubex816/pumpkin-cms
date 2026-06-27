# V2.8.32I Carryforward

V2.8.32I diagnosed the live/local health HTTP `500` root cause:

- `Jwt:SecretKey` was missing.
- JWT bearer setup encoded `jwtSettings["SecretKey"]!` directly.
- The missing value caused `System.ArgumentNullException`.
- The exception occurred before the dependency-light health handler could respond.

I source fix:

- Missing JWT config now returns no auth result instead of throwing.
- Protected routes remain unauthenticated without a valid token.
- Health routes are explicitly anonymous.
- Local no-secret health returned `200` for `/health` and `/api/health`.

Carryforward artifact:

`.tmp/v2-8-32i/pumpkin-api-health-recovery-local-fixed-posix.zip`

SHA256:

`722BC5B481043FF0B9B9B4566B2B23A52D93E7D6FDF3378087352F4904276D58`

I did not deploy this final fixed artifact because a second live deployment was outside I scope. J deployed it once.
