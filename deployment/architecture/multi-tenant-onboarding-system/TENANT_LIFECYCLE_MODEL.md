# Tenant Lifecycle Model

## States

| State | Meaning |
| --- | --- |
| `intake-draft` | Human intake is being collected. No CMS/import action has occurred. |
| `intake-ready` | Required human fields are complete enough for validation. |
| `import-package-draft` | JSON package exists but has not passed validation. |
| `import-package-valid` | Schema and cross-file validators pass. |
| `cms-preview-ready` | CMS preview import can be requested with explicit approval. |
| `cms-preview-live` | Tenant content is reviewable in CMS/preview, not production. |
| `static-export-ready` | Static export can be generated in a safe local/staging context. |
| `staging-ready` | Deployment profile validators pass for staging. |
| `staging-live` | Staging is deployed or previewed under explicit approval. |
| `production-cutover-ready` | DNS/hosting/media/form gates pass and rollback is documented. |
| `production-live` | Production cutover is complete and smoke tests pass. |
| `manual-owner-review` | Human content/legal/form/monitoring/rollback signoff is pending. |
| `indexing-final-gate` | Search Console/indexing can be requested only with final approval. |
| `paused` | Tenant is intentionally not being changed. |
| `rolled-back` | A rollback was executed and documented. |

## Transition Rule

Each state transition that mutates external systems requires an explicit approval naming the tenant, target system, intended action, rollback scope, and exclusions.

