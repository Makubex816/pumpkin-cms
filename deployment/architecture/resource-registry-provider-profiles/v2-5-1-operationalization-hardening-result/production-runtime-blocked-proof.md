# Production Runtime Blocked Proof

Status: passed.

The provider profile state matrix includes `provider-profile-production-runtime-blocked`.

Required blocked state:

- provider mode: `production-runtime`
- environment: `production`
- state: `blocked`
- global activation: `false`
- live provider writes allowed: `false`
- production writes allowed: `false`
- protected config reads: `false`
- Azure mutations: `false`

The validator fails any production-runtime profile that is not blocked or allows production/live writes.

