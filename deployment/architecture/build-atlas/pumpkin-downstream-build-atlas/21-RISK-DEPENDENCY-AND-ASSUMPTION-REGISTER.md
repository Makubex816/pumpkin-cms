# Risk, Dependency, and Assumption Register

| ID | Risk/assumption | Severity | Response |
|---|---|---:|---|
| R-001 | Public downstream main mistaken for active build | Critical | Require closeout/local-private inventory before integration. |
| R-002 | Upstream merge treated as qualified because it is on main | High | Freeze and clean-room qualify; no attached CI proof observed. |
| R-003 | Turnstile token reused after non-OK submission | High | Reset after every potentially consuming attempt; browser tests. |
| R-004 | Provider retry creates ambiguous verification state | High | Verification request idempotency/correlation and explicit outcomes. |
| R-005 | Process-local rate limit fails across instances/restarts | High | Distributed/edge rate control. |
| R-006 | CAPTCHA succeeds but duplicate FormEntries are created | Critical | Separate submission idempotency/unique persistence. |
| R-007 | Existing pages receive unstable block IDs | High | Deterministic migration, fixtures, one-time persistence. |
| R-008 | Visual editor overwrites concurrent changes | High | ETag/version conflict handling. |
| R-009 | Preview iframe assumed isolated because events are captured | High | Threat model, CSP/sandbox decision, server no-write controls. |
| R-010 | Navigation save reports success while revalidation fails | Medium | Check response and public readback. |
| R-011 | Live Atlas overwritten by package Atlas | Critical | Inventory and bridge; preserve history. |
| R-012 | Current phase disturbed during intake | Critical | Zero mutation budget; ingest only after closeout. |
| R-013 | Authorize.Net assumed present from conversation | High | Keep external gate until source observed. |
| R-014 | Private partner control plane inferred from public code | High | Contract-only integration. |
| R-015 | Notification state conflated with persistence | High | Independent status and records; FormEntry authoritative. |
