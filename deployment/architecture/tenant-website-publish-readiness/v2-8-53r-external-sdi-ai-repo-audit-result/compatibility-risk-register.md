# Compatibility Risk Register

| Severity | Risk | Impact | Mitigation |
| --- | --- | --- | --- |
| P0 | Missing external form submit route | External clients may fail. | Add `/api/forms/{tenantId}/submit/{type}` alias/adapter. |
| P0 | Missing external admin FormEntry route aliases | External admin tooling may fail. | Add aliases to current FormEntry handlers. |
| P0 | Ice/Roller hard-coded static/publish/provider maps | Secondary tenant creation may be incomplete or misrouted. | Create tenant profile registry before creation. |
| P0 | Provider metadata names do not match source containers | Backup/restore/provisioning may target wrong names. | Reconcile metadata to source/live evidence. |
| P1 | Current FormEntry model differs from prompt payload | Contact submissions may require current-only fields. | Add payload adapter/defaulting and tests. |
| P1 | External README runtime prose is stale | Operator confusion. | Treat source project/global.json as authoritative. |
| P2 | Current additive modules may appear production-ready before workflow proof | Premature use in tenant expansion. | Keep unproven modules behind read-only/prototype gates. |
