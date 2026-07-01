# Tenant Onboarding UI Map

| Onboarding Step | Current UI Surface | UI Driven Today | Package/CLI/Codex Driven Today | Manual/Secure Handoff Driven Today | Approval Needed Before Write |
| --- | --- | --- | --- | --- | --- |
| Tenant identity review | `/dashboard/tenants` | Partial | Yes | Yes | live mutation approval |
| Tenant creation | `/dashboard/tenants` source controls | Partial | Yes | Yes | live mutation approval and approved real package |
| Admin user setup | no complete wizard | No | Yes | Yes | live mutation approval |
| Brand/theme setup | `/dashboard/themes` | Yes | Yes | No for public fields | live mutation approval |
| Page baseline | `/dashboard/pages`, `/dashboard/pages/import-export` | Partial | Yes | No for public package | live mutation approval |
| Media baseline | `/dashboard/media` | Partial | Yes | Media binaries outside repo | media upload approval |
| FormDefinition setup | `/dashboard/form-builder` | Yes | Yes | Secure provider values separate | live mutation approval |
| Leads readback | `/dashboard/forms` | Yes | No | Auth session required | read-only auth approval if needed |
| Static publish review | `/dashboard/publishing`, `/dashboard/publishing/action-center` | Partial | Yes | Generated artifacts ignored | deploy approval later |
| DNS/custom domain | no Admin UI production wizard | No | Runbook-driven | Owner/operator driven | DNS approval |
| Indexing | no Admin UI production wizard | No | Runbook-driven | Owner/operator driven | indexing approval |
| Backup/restore readiness | no dedicated onboarding UI | No | Docs/scripts | Operator approval | backup/restore approval |
| External compatibility guard | docs/API aliases | No | Yes | External repo immutable | no external mutation |

Summary: Admin UI has strong editing/building surfaces, but complete tenant onboarding remains a gated package-plus-operator workflow rather than a single self-contained wizard.

