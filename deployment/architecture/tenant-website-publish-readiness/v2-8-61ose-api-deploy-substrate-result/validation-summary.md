# Validation Summary

Validation run:

| Check | Result |
| --- | --- |
| No staged files at start | passed |
| OSD submit-key source still present | passed |
| Focused OSD submit-key source test | passed |
| API build | passed |
| OSE POSIX API package verification | passed |
| Kudu wwwroot backup/checksum | passed |
| Malformed backslash cleanup policy | passed, zero deletion targets |
| One API deploy after cleanup | passed |
| Submit-key route activation probe | passed, HTTP 401 |
| Runtime no-regression | passed, 23/23 HTTP 200 |
| No form POST/no key registration/no starter mutation | passed |
| No Airstrip probe/action | passed |
| Required files exist | passed |
| Durable docs exist | passed |
| Result JSON parse | passed |
| `git diff --check` | passed |
| Trailing whitespace scan | passed |
| Secret-like scan | passed |
| Command-shaped scan | passed; only expected route, deploy, test, and commit instruction references |
| No staged files at end | passed |

No protected or generated backup/package artifacts were staged. The Kudu backup and API deployment ZIP remain outside the repo.

Exact-path commit instructions:

```powershell
git add apps/pumpkin-api/Program.cs apps/pumpkin-api/Services/TenantSubmitKeyProvisioning.cs apps/pumpkin-api/Services/IDatabaseService.cs apps/pumpkin-api/Services/IDataConnection.cs apps/pumpkin-api/Services/DatabaseService.cs apps/pumpkin-api/Services/CosmosDataConnection.cs apps/pumpkin-api/Services/MongoDataConnection.cs apps/pumpkin-api.Tests/Program.cs apps/pumpkin-api.Tests/TenantSubmitKeyProvisioningSourceTestRunner.cs apps/pumpkin-api.Tests/TenantAdminProvisioningSourceTestRunner.cs apps/pumpkin-api.Tests/DomainBindingSourceTestRunner.cs apps/pumpkin-api.Tests/UserProfileManagementSourceTestRunner.cs PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_61OSE_API_DEPLOY_SUBSTRATE_REPORT.md deployment/architecture/tenant-website-publish-readiness/v2-8-61ose-api-deploy-substrate-result deployment/architecture/pumpkin-platform/PUMPKIN_API_DEPLOYMENT_SUBSTRATE_CLEANUP_V2_8_61OSE.md deployment/architecture/pumpkin-platform/PUMPKIN_PARTY_PROS_SUBMIT_KEY_ROUTE_ACTIVATION_V2_8_61OSE.md deployment/architecture/pumpkin-platform/PUMPKIN_API_KUDU_BACKSLASH_PATH_RUNBOOK_V2_8_61OSE.md
git commit -m "Activate Party Pros submit key route after API deploy substrate cleanup"
```
