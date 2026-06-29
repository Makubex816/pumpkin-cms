# Next Phase Prompt

Continue from V2.8.43 blocked closeout.

Do not rerun V2.8.43 media proof. It succeeded and cleaned up.

Carry forward:

- MediaAsset retry closeout succeeded.
- Single-page page export/import API source fix was implemented and deployed once.
- Source page create succeeded.
- Single-page export succeeded and validated.
- Single approved import attempt returned HTTP `409`.
- Synthetic page cleanup succeeded and final readback returned HTTP `404`.
- Admin UI media/import-export readiness is read-only-ready.

Next approval should diagnose and repair the page-only import HTTP `409` behavior without performing a second import until approved. Start with source/log diagnosis for the deployed `POST /api/admin/pages/{tenantId}/import` route and confirm whether the conflict is caused by update/upsert handling, PageId conflict, or ImportRun save behavior. After source fix and tests, request approval for a new single synthetic source page, one export, one import, and cleanup.

Exact-path commit scope from V2.8.43:

- `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_43_MEDIAASSET_IMPORTRUN_SUPERPASS_REPORT.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-43-mediaasset-importrun-superpass-result/`
- `apps/pumpkin-api/Program.cs`
- `apps/pumpkin-api/Services/IDatabaseService.cs`
- `apps/pumpkin-api/Services/IDataConnection.cs`
- `apps/pumpkin-api/Services/DatabaseService.cs`
- `apps/pumpkin-api/Services/CosmosDataConnection.cs`
- `apps/pumpkin-api/Services/MongoDataConnection.cs`
- `apps/pumpkin-api.Tests/Program.cs`
- `apps/pumpkin-api.Tests/PageImportExportSourceTestRunner.cs`
