# V2.8.33B Carryforward

V2.8.33B result package:

`deployment/architecture/tenant-website-publish-readiness/v2-8-33b-static-contact-upstream-probe-bridge-repair-result/`

V2.8.33B root report:

`PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_33B_STATIC_CONTACT_UPSTREAM_PROBE_BRIDGE_REPAIR_REPORT.md`

Carryforward classification:

`static_contact_bridge_repaired_and_production_admin_readback_confirmed`

Public-safe carryforward evidence:

- Direct invalid Pumpkin API write probe returned HTTP 400 validation with no persistence.
- Direct valid Pumpkin API write probe returned HTTP 401 with no persistence, proving a tenant-key auth mismatch behind the static-contact bridge.
- Source-required Tenant auth state for `ice-rink-rentals` was aligned.
- Static contact bridge source was repaired and covered by tests.
- Isolated static-contact POST returned HTTP 200 and was visible through authenticated Admin readback.
- Production static-contact POST returned HTTP 200 and was visible through authenticated Admin readback.
- Secret values and bearer tokens were not printed.

Production trace carried forward:

`v2-8-33b-production-static-contact-20260629015903-78f5b35b`
