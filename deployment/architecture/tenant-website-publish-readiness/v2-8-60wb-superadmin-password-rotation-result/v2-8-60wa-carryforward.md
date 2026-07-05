# V2.8.60WA Carryforward

V2.8.60WA resolved the deploy blocker and proved the SuperAdmin password route was live. It then stopped because the proposed password from that phase was rejected by the live source password policy.

Carryforward into WB:

- Pumpkin API deploy retry succeeded in WA.
- Route is expected live: `POST /api/admin/users/{tenantId}/{userId}/password`.
- No deploy is approved in WB.
- Rotation did not occur in WA.
- Current Spectre Dev credential remained active at the end of WA.
- Proposed WA credential was not active.
- No WA hardcopy was created.
- No TenantAdmin password, role, or tenant assignment changed.

