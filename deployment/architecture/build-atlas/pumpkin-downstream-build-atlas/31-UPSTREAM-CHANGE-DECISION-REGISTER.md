# Upstream Change Decision Register — `18b5cea01d23`

| ID | Subsystem | Classification | Migration | Validation |
|---|---|---|---|---|
| UCD-001 | block id/name/enabled | direct adopt with migration | yes | all-block round trip; stable IDs |
| UCD-002 | visual preview/editor | adapt or port | yes | browser E2E; roles; conflict handling |
| UCD-003 | visual navigation tree | adapt or port | data review | nested operations; cache readback |
| UCD-004 | header-logo media | direct adopt or port | low | asset ownership; URL/alt proof |
| UCD-005 | tenant CAPTCHA settings | direct adopt | tenant config | secret sanitization; hostnames |
| UCD-006 | form CAPTCHA override | direct adopt | definitions | mode/action tests |
| UCD-007 | Turnstile verifier | wrap and extend | compatible | idempotency, outage, replay/expiry |
| UCD-008 | Turnstile widget/forms | adapt or port | client | reset paths; accessibility/CSP |
| UCD-009 | process-local rate limit | layer/replace | operational | multi-instance test |
| UCD-010 | submission persistence | extend downstream | FormEntry/index | exact-one/correlation/timeout |
| UCD-011 | deploy.zip ignore | direct adopt | none | artifact scan |
| UCD-012 | Authorize.Net | defer external | unknown | inspect later push |

These are intake decisions. Final path decisions require active downstream source comparison.
