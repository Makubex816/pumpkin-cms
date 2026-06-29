# V2.8.33B Static Contact Upstream Probe Bridge Repair Report

Date: 2026-06-29

Result: contact gate closed.

V2.8.33B diagnosed the hidden static-contact HTTP 502, repaired the upstream tenant-key mismatch, hardened the static contact bridge error handling, proved the repair in isolated staging, then deployed and proved production.

Final classification:

`static_contact_bridge_repaired_and_production_admin_readback_confirmed`

Public-safe evidence:

- Direct invalid Pumpkin API probe: HTTP 400 validation, route reached; auth remained ambiguous because source validates malformed payload before tenant-key verification.
- Direct valid Pumpkin API write probe: exactly one sent, HTTP 401; no entry created.
- Tenant API key alignment: source-required `Tenant` container/document was created or confirmed for `ice-rink-rentals`; approved static key verified after alignment.
- Static contact source repair: upstream non-OK statuses now preserve public-safe status/code instead of always collapsing to 502; success response parsing now falls back to the local entry id when needed.
- Local checks: compat syntax and tests passed; Ice type-check, static validation, and sanitized build passed.
- Isolated appsettings repair and isolated deploy: succeeded.
- Isolated POST: exactly one sent, HTTP 200, Admin readback found trace `v2-8-33b-isolated-static-contact-20260629015702-1bb2fc4f`.
- Production appsettings repair and production deploy: succeeded.
- Production POST: exactly one sent, HTTP 200, Admin readback found trace `v2-8-33b-production-static-contact-20260629015903-78f5b35b`.

Result package:

`deployment/architecture/tenant-website-publish-readiness/v2-8-33b-static-contact-upstream-probe-bridge-repair-result/`

Scoped source files changed:

- `deployment/static-azure/forms/static-form-endpoint-compat/contact-handler.mjs`
- `deployment/static-azure/forms/static-form-endpoint-compat/test-static-form-endpoint-compat.mjs`

Commit instructions:

```powershell
git add "PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_33B_STATIC_CONTACT_UPSTREAM_PROBE_BRIDGE_REPAIR_REPORT.md" "deployment/architecture/tenant-website-publish-readiness/v2-8-33b-static-contact-upstream-probe-bridge-repair-result/" "deployment/static-azure/forms/static-form-endpoint-compat/contact-handler.mjs" "deployment/static-azure/forms/static-form-endpoint-compat/test-static-form-endpoint-compat.mjs"
git commit -m "fix: repair static contact bridge and close contact gate"
```
