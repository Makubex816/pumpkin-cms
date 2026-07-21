# Starter App and Control-Plane Reconciliation

## Upstream public boundary

The public starter remains a single-tenant runtime and content admin. It now includes CAPTCHA-aware forms and an interactive page/navigation editor. Pumpkin Cloud hosting, billing, provisioning, and marketing remain a separate partner boundary.

## Downstream composition

```text
Shared starter primitives
- rendering
- content/page/theme/media/form editing
- tenant-bound authentication
- CAPTCHA widget and public form resolution
- visual preview/editor

Downstream control plane
- tenant selection and lifecycle
- TenantAdmin/SuperAdmin scopes
- onboarding and launch gates
- lead inbox across roles
- deployments and domains
- notifications and operational workers
- payment orchestration
- Atlas/evidence
```

## Adapter rule

Do not fork the entire visual editor merely to add tenant scope. Introduce server-owned tenant context and permission adapters around shared routes/components. Where public starter APIs are tenant-bound by deployment configuration, a downstream SuperAdmin enters an explicit authorized tenant context instead of passing an arbitrary browser-controlled tenant ID.

## Parity ledger

For rendering, routing, blocks, forms, media, themes, navigation, authentication, caching, CAPTCHA, and visual editing, record upstream version, downstream adapter/extension, divergence rationale, parity tests, owner, and revisit trigger.
