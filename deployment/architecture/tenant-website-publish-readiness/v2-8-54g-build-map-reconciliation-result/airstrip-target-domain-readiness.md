# Airstrip Target Domain Readiness

Target domain: `airstripclublasvegas.com`

Readiness classification: planning_locked_not_created

Rules:

- This is the only next true target domain for planning.
- Do not create the tenant in V2.8.54G.
- Do not mutate DNS or deploy to the domain.
- Do not use the old `strip-club-near-me-vegas` package for live creation unless reconfirmed.
- If an incoming package contains a different tenantId or domain, classify it as a package-target mismatch and normalize only after owner approval.

Recommended future raw-package intake:

- Initial raw ZIP/folder drop zone: ignored local path `.tmp/v2-8-55-airstrip-package-intake/source/`.
- Public sanitized evidence: future result package only, without secrets or proprietary raw binaries unless explicitly approved.
- Normalized tenant ID proposal: derive from `airstripclublasvegas.com` after package inspection, not before.
- DNS: deferred until post-creation production cutover approval.

