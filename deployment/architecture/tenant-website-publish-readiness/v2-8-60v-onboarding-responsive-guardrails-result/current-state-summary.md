# Current State Summary

Phase: V2.8.60V Tenant Onboarding Mobile Responsive Guardrails.

Status: guardrails implemented; no live mutation; responsive replay blocker recorded.

Current state:

- Tenant package contract now includes responsive readiness requirements for new or updated packages.
- New `validation/responsive-routes.json` schema and example files define the V2.8.60V route/viewport matrix.
- Validator accepts legacy normalized packages with a warning, but enforces responsive readiness when `responsiveReadinessRequired` is true.
- Reusable browser checker exists and runs GET-only responsive proof.
- Airstrip normalized package still validates.
- Airstrip production default-host GET route health is HTTP 200, but the responsive replay found mobile overflow on `/airstrip-the-club`.
- DNS/custom-domain work remains on hold.
