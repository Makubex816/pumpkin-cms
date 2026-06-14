# Risk And Open Decisions

| Item | Risk | Decision |
| --- | --- | --- |
| Browser-executed API mode | Source/runtime route checks do not execute the client in a real browser session. | Keep as future QA unless browser automation/runtime auth is explicitly approved. |
| API auth/session | API mode needs an existing Admin token and tenant scope. | Use `AuthContext`; never ask operators to paste secrets into reports. |
| API base URL | Admin default uses the existing Admin API URL export; local QA can override by query string. | Keep fixture fallback default so missing API config is non-blocking. |
| Contract drift | V2.9.9 exposes route envelopes, while Admin uses one viewer model. | Compose the eight GET results and run parity harness checks. |
| CORS remediation | Lazy resolution changes when tenant DB lookup happens. | Scope is safe: only `TenantCors` resolves DB; `AllowAll` remains default for Admin/auth routes. |
| Future actions | API mode could imply operational readiness. | Disabled actions remain disabled and source-scanned. |

Open future decision:

- whether to add browser automation or an approved local auth fixture to prove client-executed API mode end to end.
