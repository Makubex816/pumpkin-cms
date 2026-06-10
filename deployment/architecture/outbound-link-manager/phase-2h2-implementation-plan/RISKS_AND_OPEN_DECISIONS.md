# Risks And Open Decisions

## Risks

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Scanner over-detects text that is not a managed link | Medium | Use declared link-bearing fields first. |
| Scanner misses component-specific link props | High | Add component field registry and warning output. |
| URL normalization collapses distinct business links | Medium | Keep original URL on instances and keep query sorting conservative. |
| Renderer bypasses governance state | High | Require snapshot resolver before renderer changes. |
| Bulk action preview differs from execution | High | Execution must stop if counts differ. |
| Tenant isolation bug in API | High | Mandatory tenant/site filters and tests. |
| Backup integration omitted | High | Treat outbound link backup files as acceptance gate. |
| Live-readonly scan accidentally becomes write-capable | High | Separate mode, approval gate, and no write clients. |

## Open Decisions

- Whether runtime persistence will be Cosmos containers, existing CMS collections, or relational tables.
- Whether wildcard domain policies are supported in v1.
- Whether URL fragments are registry-distinct or instance-only.
- Whether query parameter ordering is normalized.
- Whether audit backup includes full logs or summaries only.
- Whether Admin write actions ship before renderer integration or after local renderer proof.
