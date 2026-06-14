# Import No-Go Condition Matrix

| No-go condition | Validator coverage |
| --- | --- |
| tenantKey missing | `invalid-missing-tenant-key.import-package.json` |
| siteKey missing | Required field rule |
| owner approval missing | `invalid-missing-owner-approval.import-package.json` |
| tenant paused and resume not explicitly approved | `invalid-paused-tenant-resume-without-approval.import-package.json` |
| package requests production mutation | `invalid-production-mutation-requested.import-package.json` |
| package contains secret-like value | `invalid-secret-like-value.import-package.json` |
| package references protected config | `invalid-protected-config-reference.import-package.json` |
| Backup Center prerequisite missing | `invalid-missing-backup-proof.import-package.json` |
| Resource Registry binding missing | Required non-empty refs |
| Provider Profile binding ambiguous/missing | Required non-empty refs |
| Runtime QA prerequisite missing | Required non-empty refs |
| rollback plan missing | Required rollback plan ID |
| Google/Search Console/indexing requested | Security boundary rule |
| deployment/DNS/custom-domain mutation requested | Security boundary rule |

Any no-go condition blocks future import execution.
