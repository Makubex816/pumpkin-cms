# Security Boundary Summary

V2.3.2 maintained the requested boundaries.

| Boundary | Result |
| --- | --- |
| Azure resource creation | none |
| Azure mutation | none |
| RBAC assignment | none |
| OLM staging provider write | none |
| Production database migration | none |
| Production provider write | none |
| CMS write | none |
| App deployment | none |
| DNS change | none |
| Search Console/indexing | none |
| Live-page publication | none |
| Protected config read | none |
| Key Vault secret value query | none |
| Keys/listKeys | none |
| Connection string generation | none |
| SAS generation | none |
| Token/cookie/auth header export | none |

Only safe read-only Azure account/resource-group checks and local Bicep build validation were performed.

