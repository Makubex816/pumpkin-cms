# Risks And Open Decisions

## Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| First prototype reaches for real CMS/database too soon | violates hard-stop boundary | local placeholder adapters first |
| Standard backup accidentally includes escrow data | secret exposure | validator requires `ESCROW_NOT_INCLUDED.md` and rejects escrow payloads |
| Path guard flags escrow docs due terminology | staging friction | value-level secret scan plus explicit docs-path review |
| API/UI starts before local validator is mature | unsafe operator workflow | defer API/Admin UI until exporter and validator pass |
| Retention cleanup deletes wrong files | data loss | plan-only first; cleanup worker later with audit |
| Escrow encryption chosen too late | model mismatch | define interfaces and fixtures in 2F-3 even before active encryption |

## Open Decisions

| Decision | Status |
| --- | --- |
| Final long-term package home: `tools/` vs architecture-adjacent package | open after prototype |
| Encryption library/KMS choice | open for 2F-5 planning |
| Production backup storage provider | open |
| Admin RBAC integration details | open |
| Database export adapter timing | open |
| Media blob copy adapter timing | open |
| Retention window defaults | open |
| Escrow multi-party approval threshold | open |

## Current Recommendation

Start with the architecture-adjacent local Node package in Phase 2F-3, prove the standard bundle and validator, and keep escrow as modeled hard stops until the fake-secret encrypted escrow prototype is approved.
