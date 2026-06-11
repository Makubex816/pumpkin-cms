# Security Boundary Summary

V2.3.4 crossed only the approved staging RBAC boundary.

| Boundary | Result |
| --- | --- |
| Cosmos data-plane RBAC assignment | yes |
| Storage RBAC assignment | no |
| Key Vault data-plane assignment | no |
| Azure resource creation | no |
| OLM staging provider data write | no |
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

Operator UPN and credential material were not committed.

