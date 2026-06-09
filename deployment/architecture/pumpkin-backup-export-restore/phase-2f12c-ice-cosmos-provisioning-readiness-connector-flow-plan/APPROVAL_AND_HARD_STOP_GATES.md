# Approval And Hard Stop Gates

## Separate Approvals Required

| Gate | Required approval |
| --- | --- |
| Provider resolver implementation | Implementation foundation approval |
| CMS metadata endpoint | API implementation approval |
| Live read-only provider verification | Read-only live verification approval |
| Cosmos provisioning preflight | Planning/preflight approval |
| Cosmos provisioning execution | Azure mutation approval |
| CMS runtime wiring | Config/deployment approval |
| Data seed/migration preflight | Planning/preflight approval |
| Data seed/migration execution | CMS/database write approval |
| Cosmos export preflight | Readiness planning approval |
| Cosmos export execution | Database export approval |
| Production restore proof | Owner QA/acceptance approval |

## Hard Stops Preserved

- No CMS writes in this phase.
- No Azure mutation in this phase.
- No protected config reads.
- No real secret export.
- No database export/import.
- No deployment.
- No Search Console/indexing.
- No live-page publication.

## Live Pages

Live pages remain hard-stopped until a separate owner-approved publication and indexing sequence exists outside this Backup Center planning pass.
