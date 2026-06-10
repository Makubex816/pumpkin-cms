# Gap Register

| Severity | Gap | Impact | Planned Handling |
| --- | --- | --- | --- |
| High | Local scanner package does not exist yet | No executable offline proof path | Create `local-implementation/` in Phase 2H-3 with fixtures and tests only. |
| High | Contract types are not generated for TS/C# | Drift between scanner, Admin, API, and backups | Keep JSON schemas authoritative in 2H-3; plan TS/C# model mapping in 2H-4. |
| High | Renderer integration has no snapshot adapter | Public output could bypass registry later | Add a snapshot resolver contract before renderer code changes. |
| High | Backup Center does not yet include outbound link files | Restore cannot prove link governance state | Add backup integration only after local registry contracts pass. |
| Medium | URL normalization policy needs edge-case tests | Duplicate or mismatched records possible | Add fixtures for case, fragments, default ports, query strings, and invalid schemes. |
| Medium | Audit retention policy is not final | Backups could become large | Use audit summary export first; defer full audit export policy. |
| Medium | Bulk action execution semantics are not final | Risk of overbroad changes | Implement preview-only before execution endpoints. |
| Medium | Live-readonly inventory source not selected | Future Ice inventory may need provider choice | Defer to 2H-8 preflight after local scanning works. |
| Low | Admin screen layout is conceptual | UX may require iteration | Keep Admin implementation behind 2H-7 planning refresh. |
| Low | Example templates are minimal | Fixtures need richer cases | Expand fixture matrix in 2H-3. |

No blockers prevent Phase 2H-3 local scanner/registry foundation.
