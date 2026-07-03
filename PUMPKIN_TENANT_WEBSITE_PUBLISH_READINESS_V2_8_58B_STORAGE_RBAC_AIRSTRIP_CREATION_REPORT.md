# Pumpkin Tenant Website Publish Readiness V2.8.58B Storage RBAC Airstrip Creation Report

Phase status: closed_success.

Lane: V2.8 Tenant Website / Pumpkin Live Platform Readiness.

Classification: storage_rbac_repair_airstrip_controlled_creation_resume_required_blob_media_upload_no_deploy.

Summary:

- V2.8.58A TenantAdmin route repair carried forward successfully.
- Storage RBAC data-plane repair passed at the iceskatingmedia storage-account scope.
- Airstrip media container exists and 13 assets were uploaded under assets/.
- Airstrip tenant $tenantId exists with tenant API key/hash present and public tenant-key proof HTTP 200.
- Airstrip TenantAdmin was created and login returned HTTP 200.
- Pages, theme, FormDefinition, and 13 MediaAsset records were created/read back.
- Tenant isolation proof passed.
- Ice no-change proof passed.
- Runtime no-regression GET-only proof passed.

No deploy, production cutover, DNS mutation, indexing action, contact POST, form submission, storage key/listKeys call, SAS generation, connection string generation, or Key Vault secret query occurred.

Result package:

$resultRel/

Durable docs:

- deployment/architecture/pumpkin-platform/PUMPKIN_AIRSTRIP_STORAGE_RBAC_REPAIR_V2_8_58B.md
- deployment/architecture/pumpkin-platform/PUMPKIN_AIRSTRIP_CONTROLLED_CREATION_V2_8_58B.md
- deployment/architecture/pumpkin-platform/PUMPKIN_AIRSTRIP_MEDIA_BINDING_V2_8_58B.md
- deployment/architecture/pumpkin-platform/PUMPKIN_AIRSTRIP_TENANT_ISOLATION_V2_8_58B.md

Exact-path commit instructions:

~~~powershell
git add -- "PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_58B_STORAGE_RBAC_AIRSTRIP_CREATION_REPORT.md" "deployment/architecture/tenant-website-publish-readiness/v2-8-58b-storage-rbac-airstrip-creation-result/" "deployment/architecture/pumpkin-platform/PUMPKIN_AIRSTRIP_STORAGE_RBAC_REPAIR_V2_8_58B.md" "deployment/architecture/pumpkin-platform/PUMPKIN_AIRSTRIP_CONTROLLED_CREATION_V2_8_58B.md" "deployment/architecture/pumpkin-platform/PUMPKIN_AIRSTRIP_MEDIA_BINDING_V2_8_58B.md" "deployment/architecture/pumpkin-platform/PUMPKIN_AIRSTRIP_TENANT_ISOLATION_V2_8_58B.md"
git diff --cached --name-only
git diff --cached --check
git commit -m "Close V2.8.58B Airstrip controlled tenant creation"
~~~
