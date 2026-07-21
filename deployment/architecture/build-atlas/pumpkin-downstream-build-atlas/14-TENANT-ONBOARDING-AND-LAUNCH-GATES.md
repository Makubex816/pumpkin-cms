# Tenant Onboarding and Launch Gates

A tenant cannot pass launch merely because its site renders.

## Required tenant facts

- immutable tenant ID and mutable display/contact settings;
- deployment binding and allowed origins;
- active theme and visual-editor role scope;
- canonical FormDefinitions;
- CAPTCHA site key, secret reference, allowed hostnames, default mode, and form actions;
- distributed rate-limit policy;
- TenantAdmin users and permissions;
- notification recipients and delivery mode;
- domain/TLS/runtime health;
- Atlas record and evidence links.

## Launch proof

```text
no-write preflight
→ controlled page/editor save in nonproduction or approved scope
→ form render and CAPTCHA challenge
→ one controlled submission
→ exact-one FormEntry readback
→ TenantAdmin visibility
→ SuperAdmin visibility if applicable
→ cross-tenant denial
→ notification status recorded independently
→ rollback/readiness check
→ Atlas/package update
```
