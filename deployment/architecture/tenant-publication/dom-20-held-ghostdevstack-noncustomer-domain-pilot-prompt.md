# TASK ID DOM-20-A01 — GhostDevStack non-customer subdomain/DNS/TLS pilot

Status: `HELD_NOT_AUTHORIZED`.

## Boundary

This is a future non-customer domain pilot only. It grants no current authority and must not be used for customer domains, DNS, nameservers, registrar actions, TLS bindings, indexing, Airstrip, email, payments, capacity, paid plans, or application deployment.

GhostDevStack remains unbound. External parked-site behavior is observational evidence only and must not be attributed to Pumpkin without authoritative control-plane proof.

## Activation requirements

- explicit owner authorization naming the exact non-customer hostname and resource;
- completed `PLATFORM_SECRET_ROTATION_AND_PARITY_RECOVERY` with authoritative health, identity, isolation, and deployment-identity readback;
- authoritative registrar/DNS ownership readback;
- approved Azure/external DNS path, record plan, TTLs, validation method, TLS plan, and rollback;
- accepted static artifact already proven on its default hostname;
- zero-secret browser/static-artifact boundary and an approved deployment credential provider;
- bounded mutation and readback attempt counts;
- preserved customer and production resources.

## Future proof sequence

Plan first; checkpoint current records; add only the approved validation/binding records; prove ownership and TLS; keep noindex; verify hostname isolation and headers; roll back records and binding; prove the default hostname remains healthy; and record exact before/after authoritative state.

Until activation, perform read-only evidence maintenance only.

PUB-30-A01 granted no domain or deployment authority and performed zero GhostDevStack, registrar, DNS, nameserver, validation-record, TLS, or custom-domain mutations. That zero-mutation carryforward is the DOM-20 entry baseline.
