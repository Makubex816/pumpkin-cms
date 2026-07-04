# Implementation Phase Map

Status: design complete.

## V2.8.60T: Data Model And Read-Only Admin Shell

Scope:

- Add DomainBinding .NET and TypeScript models.
- Add data access interfaces and repository implementation.
- Add GET-only SuperAdmin API routes.
- Add read-only Admin UI route at `/dashboard/onboarding/domains`.
- Add unit tests for model serialization and state guards.
- No live DNS or Azure mutation.

Exit gate:

- SuperAdmin can view empty and seeded DomainBinding records.
- TenantAdmin cannot access the route or API.

## V2.8.60U: Manual DNS Packet And Validation

Scope:

- Add create binding action.
- Add DNS packet generation.
- Add public DNS validation.
- Add audit events.
- Add Airstrip draft binding using preserved V2.8.60 packet as input.
- Still no Azure hostname binding unless separately approved.

Exit gate:

- Airstrip DNS packet is visible in Admin UI.
- DNS expected vs observed can be validated read-only.

## V2.8.60V: Azure Binding, TLS, Runtime Proof, Promotion

Scope:

- Add approval-gated Azure App Service hostname binding.
- Add managed TLS status tracking.
- Add runtime proof.
- Add canonical promotion and rollback.
- Use Airstrip first under explicit approval.

Exit gate:

- Airstrip custom domain can move from DNS-verified to live under auditable state transitions.

## Later Phases

- Bluehost owner-assisted automation hardening.
- Azure DNS provider support for preapproved zones.
- Front Door/CDN support.
- Google Workspace email DNS workflow.
- Search/indexing final gate.

