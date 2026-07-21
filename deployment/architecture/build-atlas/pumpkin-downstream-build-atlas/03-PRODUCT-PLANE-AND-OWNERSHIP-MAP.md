# Product Planes and Ownership Map

## Planes

| Plane | Primary owner | Intended responsibility | Intake implication |
|---|---|---|---|
| Public Pumpkin core | Partner/shared | API contracts, models, block rendering, starter runtime, single-tenant content admin | Prefer upstream implementation when qualified. |
| Partner Pumpkin Cloud control plane | Partner/private | Hosting, billing, provisioning, cross-customer cloud operations | Integrate through explicit contracts only; private implementation is not assumed. |
| Downstream rental platform | User/project | Multi-tenancy, TenantAdmin/SuperAdmin, tenant onboarding, launch gates, production operations | Must survive every upstream intake. |
| Tenant runtimes | User/project | Ice, Party Pros, Airstrip, Vegas, future tenants | Must be reconciled under one universal contract. |
| Workers/event-rental applications | Parallel/unknown | Adjacent event-rental software | Separate discovery and contract lane. |

## Capability ownership after this intake

```text
Upstream owns or strongly supplies:
- FormDefinition and FormEntry primitives
- public form rendering and submission route
- tenant/per-form CAPTCHA settings and Turnstile adapter
- starter content administration
- visual page/block/navigation editing
- shared models and block renderers

Downstream owns or must prove:
- active multi-tenant product composition
- TenantAdmin and SuperAdmin authorization boundaries
- lead inbox/export/status workflows across roles
- exact-one persistence and submission/correlation idempotency
- distributed abuse controls
- notification lifecycle separate from FormEntry persistence
- onboarding/launch proof across every tenant
- deployment, rollback, Atlas, and operational evidence
- payment orchestration and business-specific product behavior
```

## Seamless downstream principle

Upstream source is used as the default shared primitive when it is stronger and compatible. Downstream integrations should add adapters, orchestration, and control-plane behavior around stable upstream contracts rather than copying entire subsystems into divergent forks.
