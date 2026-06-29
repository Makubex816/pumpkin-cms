# V2.8.37A Admin UI App Service Deployment Repair Result

Date: 2026-06-29

Status: complete.

This package records the V2.8.37A repair of the Admin UI App Service package/deployment shape, isolated proof, production default-host proof, and live Admin API read-only proof.

Final classification: `admin_ui_appservice_package_repair_succeeded_production_default_host_live_readonly_proven`

Primary report:

`PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_37A_ADMIN_UI_APPSERVICE_DEPLOYMENT_REPAIR_REPORT.md`

Important result:

- The V2.8.37 OneDeploy/Kudu 400 was caused by Windows-style ZIP entry paths.
- The V2.8.37A ZIP used POSIX forward-slash entries.
- Isolated Admin Web App deployment and runtime proof passed.
- Production Admin Web App was created and deployed with the same proven artifact.
- Admin API login and read-only tenant/page checks passed.
- Tenant content remains unseeded: `container_ready_no_content_seeded`.
