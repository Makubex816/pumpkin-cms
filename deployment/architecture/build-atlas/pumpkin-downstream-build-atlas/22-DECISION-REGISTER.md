# Decision Register v3

| ID | Decision | Status | Evidence/trigger |
|---|---|---|---|
| DEC-001 | Upstream intake/downstream reconciliation, not blind merge | accepted | operating contract |
| DEC-002 | `18b5cea01d23298b95b5945999e66a4aec8d748b` is an intake candidate, not qualified baseline | accepted | source observed; no attached CI proof |
| DEC-003 | Public `Makubex816/main` is historical lineage, not active product truth | accepted | zero ahead / 59 behind / merge base |
| DEC-004 | Protect current live build until complete closeout ingestion | accepted | owner instruction/build plan |
| DEC-005 | Adopt upstream tenant/per-form CAPTCHA contract | accepted | source observed |
| DEC-006 | Wrap/extend verifier for idempotency, telemetry, outage behavior | accepted | gap assessment |
| DEC-007 | Reset CAPTCHA after every potentially consuming attempt | accepted | single-use lifecycle |
| DEC-008 | Submission idempotency remains separate from CAPTCHA | accepted | exact-one FormEntry invariant |
| DEC-009 | Adopt/port visual editor rather than rebuild | accepted | substantial upstream source |
| DEC-010 | Require block-ID migration and all-block proof | accepted | new persistent identity |
| DEC-011 | Add downstream role/tenant adapters around shared editor | accepted | single-tenant starter vs multi-tenant product |
| DEC-012 | FormEntry authoritative; email secondary | accepted | universal lead program |
| DEC-013 | Preserve/bridge existing Atlas; do not overwrite blindly | accepted | owner requirement |
| DEC-014 | Authorize.Net remains externally gated | accepted | not observed |
| DEC-015 | Load package into current chat only after closeout ingestion/regeneration | accepted | avoid stale state |
