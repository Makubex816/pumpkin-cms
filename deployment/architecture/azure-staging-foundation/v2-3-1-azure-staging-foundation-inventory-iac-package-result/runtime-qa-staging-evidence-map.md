# Runtime QA Staging Evidence Map

Runtime QA must remain reusable across PumpkinCMS modules and must not require live writes for local validation.

| Runtime QA evidence | Required before first OLM write | Source |
| --- | --- | --- |
| Admin page load for `/dashboard/outbound-links` | yes | Local/offline or fake-provider runtime QA harness |
| Provider mode messaging | yes | UI evidence showing local, fake, staging-simulated, live-readonly, or live-write-approved state |
| No uncontrolled write calls | yes | Browser/API harness network guard for POST, PUT, PATCH, DELETE |
| API provider-state/readiness boundary | yes | Readiness endpoint or local service check |
| Write-action gate messaging | yes | Admin/API disabled or approval-required state evidence |
| Trace/log redaction check | yes | Evidence that URLs, tokens, cookies, auth headers, and secrets are not printed |
| Staging profile gate check | yes | Provider profile refuses live write unless exact approval profile is present |
| Lightweight fallback check | yes if browser automation unavailable | Safe local route/module smoke check with no protected config |

## Evidence Storage

Evidence must be captured under ignored `.tmp` output or future approved staging evidence storage. Generated screenshots, traces, logs, and `.tmp` artifacts must not be staged into Git.

