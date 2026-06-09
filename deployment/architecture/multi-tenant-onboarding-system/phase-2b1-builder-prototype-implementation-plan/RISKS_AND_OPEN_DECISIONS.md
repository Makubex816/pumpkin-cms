# Risks And Open Decisions

## Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Answers model drifts from import schemas | Generated package may fail validator unexpectedly. | Keep generator tests pinned to validator fixtures and schema files. |
| Builder duplicates validator logic badly | Inconsistent pass/fail behavior. | Keep pre-generation checks shallow and rely on validator for package authority. |
| Secret-like values appear in answers | Security incident risk. | Scan answers before generation and redact any finding. |
| Output overwrite damages unrelated files | Local data loss. | Resolve output path and overwrite only known generated files. |
| Users mistake generated package for launched tenant | Operational confusion. | Repeat local-only boundary in CLI, reports, and support packet. |
| Support packet leaks raw answers | Privacy/security risk. | Summarize answers and exclude rejected secret-like values. |
| Page block model is still basic | Generated pages may be too skeletal. | Treat pages as placeholders and document future block schema work. |

## Open Decisions

- Should Phase 2B-1 live under `validator-implementation/` or a sibling `builder-implementation/` folder?
- Should the builder use the validator API directly or spawn validator CLI for the first prototype?
- Should `--support-packet` imply `--validate` or require both flags?
- Should failed generated packages remain in output by default, or be written under a `failed/` subfolder?
- How much of `owner-contacts.json` and `approvals.json` should the prototype generate before the current validator requires them?
- Should answers JSON have its own schema in Phase 2B-1 or a lightweight custom validator first?
- Should future media export copy safe images, or remain manifest-only until a later approval?
