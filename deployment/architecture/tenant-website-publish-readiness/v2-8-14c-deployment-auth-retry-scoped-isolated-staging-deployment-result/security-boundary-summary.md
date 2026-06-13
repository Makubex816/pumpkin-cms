# Security Boundary Summary

Confirmed:

| Boundary | Result |
| --- | --- |
| Deployment token value printed/exported/listed/logged/written | No |
| Protected config read | No |
| `.env.local` read/print/copy/move/rename/parse/source/modify | No |
| Deployment to `swa-ice-static-staging` | No |
| Production-domain deployment | No |
| Scoped isolated static artifact deployment | Yes, exactly one |
| Broad retry after deployment | No |
| DNS change | No |
| Custom-domain mutation | No |
| App settings mutation | No |
| Azure infrastructure creation | No |
| Azure resource configuration mutation beyond scoped artifact deployment | No |
| RBAC assignment | No |
| CMS writes | No |
| MediaAsset writes | No |
| Provider writes | No |
| Key Vault secret query | No |
| keys/listKeys | No |
| Connection strings | No |
| SAS | No |
| Contact form submission | No |
| Contact endpoint POST | No |
| External crawling | No |
| Outbound URL checks | No |
| Indexing | No |
| Live publication | No |

Generated `.tmp`, `.static-artifacts`, `.next`, `dist/out`, and package output evidence remains unstaged.
