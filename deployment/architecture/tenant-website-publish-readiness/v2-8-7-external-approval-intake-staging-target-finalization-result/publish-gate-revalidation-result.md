# Publish Gate Revalidation Result

Status: revalidated from the V2.8.6 sanitized output; no new build required for this docs-only packet.

Carryforward validation:

- sanitized build: passed, `sanitized_20260612151525`
- local static integrity: passed
- static output classifier: blocked external approval gate
- staging package classifier: blocked external approval gate
- Runtime QA evidence: passed, `runtimeqa_67425f67f7a4c3d7`
- Resource Registry operational bindings: passed
- OLM provider profile check: passed, live writes not allowed

V2.8.7 changed docs/control records only. It did not alter source, validators, or static output.

Additional V2.8.7 local validation:

- `npm run validate:static:ice`: passed from `apps/ice-rink-web`.
- `npm run type-check`: passed from `apps/ice-rink-web`.
- `validate-static-output.mjs --site ice-rink-rentals --out <sanitized out>`: expected no-go, `localStaticIntegrityOk: true`, `externalApprovalGateCount: 2`.
- `validate-staging-package.mjs --site ice-rink-rentals --folder <sanitized out>`: expected no-go, `localStaticIntegrityOk: true`, `externalApprovalGateCount: 2`.

The static form environment variables were blanked inside the two classified validator processes so ambient terminal values were not treated as approval evidence.
