# Risk And Open Decisions

## Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| .NET 10 runtime stack token unavailable | App Service creation/deploy could fail | Verify runtime stack before deployment approval |
| Health endpoint missing | Runtime QA cannot cleanly distinguish process health | Add `GET /api/health` before deployment |
| Cosmos binding uses connection string | Secret handling risk | Prefer Key Vault reference under existing setting name |
| Tenant CORS origins incomplete | Browser contact/API checks may fail | Verify tenant allowed origins before isolated POST |
| Admin and static contact use different API base URLs | Write-read proof fails | Single canonical `PUMPKIN_API_URL`/`NEXT_PUBLIC_API_URL` |
| First API host has no previous package | Rollback means disable new host, not revert to older API | Keep production contact unbound until API proof passes |
| Production binding rushed | Public contact can accept without Admin persistence again | Require isolated write-read proof first |

## Open decisions

1. Confirm exact Azure App Service runtime token for .NET 10.
2. Decide whether first protected binding uses App Service settings directly or Key Vault references.
3. Decide whether to add a production Key Vault in the same phase as App Service creation.
4. Decide Admin deployment target and owner for `NEXT_PUBLIC_API_URL` binding.
5. Decide whether API custom domain is needed later; it is not needed for the first persistence proof.
