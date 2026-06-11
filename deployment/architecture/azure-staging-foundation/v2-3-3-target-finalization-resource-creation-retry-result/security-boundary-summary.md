# Security Boundary Summary

V2.3.3 crossed the approved Azure staging creation boundary only.

| Boundary | Result |
| --- | --- |
| Azure staging resource group creation/update | yes |
| Azure staging foundation deployment | yes |
| RBAC assignment | no |
| OLM staging provider write | no |
| Production database migration | no |
| Production provider write | no |
| CMS write | no |
| App deployment | no |
| DNS change | no |
| Search Console/indexing | no |
| Live-page publication | no |
| Protected config read | no |
| Key Vault secret value query | no |
| Keys/listKeys | no |
| Connection string generation | no |
| SAS generation | no |
| Token/cookie/auth header export | no |

Created resources are staging-scoped and tagged `production=false`.

