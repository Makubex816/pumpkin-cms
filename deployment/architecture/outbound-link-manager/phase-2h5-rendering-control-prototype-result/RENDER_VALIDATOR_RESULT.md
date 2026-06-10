# Render Validator Result

Implemented validator:

- `src/validators/render-output-validator.mjs`

Validator proof results:

| Proof | Status | Decisions | Active Anchors | Failures |
| --- | --- | ---: | ---: | ---: |
| Active links | passed | 5 | 5 | 0 |
| Disabled global | passed | 1 | 0 | 0 |
| Domain blocked | passed | 1 | 0 | 0 |
| Pending review | passed | 1 | 0 | 0 |

Validator coverage includes tenant/site scope, known link and instance references, allowed actions, allowed reason codes, active anchor safety, disabled and policy-blocked anchor prevention, hidden/plain-text safety, fallback URL rendering, script tag rejection, and `.tmp` output enforcement.
