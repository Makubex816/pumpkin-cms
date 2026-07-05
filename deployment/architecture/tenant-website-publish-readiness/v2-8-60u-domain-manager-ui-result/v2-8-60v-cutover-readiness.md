# V2.8.60V Cutover Readiness

Status: not ready.

Ready:

- Domain Manager UI is live in production.
- Airstrip DomainBinding is visible to SuperAdmin.
- DNS packet is visible and correct.
- Read-only DNS validation can be triggered.
- TenantAdmin is denied.

Not ready:

- DNS validation remains `pending`.
- Azure custom-domain binding is not approved in V2.8.60U.
- TLS binding is not approved in V2.8.60U.
- Domain promotion is not approved in V2.8.60U.

Next approval should be V2.8.60V only after owner DNS records are applied or the owner approves a controlled DNS/binding cutover phase.
