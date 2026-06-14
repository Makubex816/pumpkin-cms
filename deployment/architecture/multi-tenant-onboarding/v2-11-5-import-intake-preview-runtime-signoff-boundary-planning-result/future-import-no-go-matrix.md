# Future Import No-Go Matrix

Status: created.

Any of these conditions blocks future import execution:

| No-go condition | Default result | Required unblock |
| --- | --- | --- |
| Missing approval manifest | Block | Provide signed manifest with exact package, tenant, site, mode, and boundary. |
| Package hash mismatch | Block | Rebuild/revalidate package and reapprove exact digest. |
| Missing owner approval | Block | Add named owner approval. |
| Missing operator approval | Block | Add named operator approval. |
| Missing backup evidence | Block | Bind Backup Center evidence and restore/readback plan. |
| Missing Resource Registry binding | Block | Bind target/source resource records. |
| Missing Provider Profile binding | Block | Bind provider profile and allowed provider scope. |
| Missing Runtime QA evidence | Block | Run approved Runtime QA and bind evidence. |
| Missing rollback plan | Block | Provide rollback/abort plan. |
| Missing readback plan | Block | Provide deterministic readback checks. |
| Missing audit trace ID | Block | Generate and bind trace ID. |
| Tenant paused | Block | Keep paused/no-import unless separate resume approval exists. |
| Roller resume requested without approval | Block | Require separate Roller resume approval. |
| Import mode ambiguous | Block | Choose exact approved mode. |
| CMS/provider write not explicitly scoped | Block | Keep write path closed. |
| Deployment, DNS, indexing, contact POST, crawl, or Azure mutation bundled into import | Block | Split into separately approved phases. |
| Protected config or secret required | Block | Use safe config-free preflight or obtain separate approved secret-handling procedure. |
| Existing live tenant conflict | Block | Create target conflict resolution plan before execution. |

