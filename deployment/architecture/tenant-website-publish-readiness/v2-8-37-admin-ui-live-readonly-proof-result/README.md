# V2.8.37 Result Package

Status: `blocked_after_isolated_onedeploy_failure`.

V2.8.37 built a deployable standalone Admin UI artifact, created the isolated Admin App Service target, attempted one isolated deployment, and stopped before production because the isolated deployment failed in Azure OneDeploy/Kudu.

The live Pumpkin Admin API read-only proof passed: login succeeded, tenant/role context was verified in public-safe form, and tenant/pages/hubs/content-hierarchy GET routes returned 200.

No contact POST, content write, DNS/custom-domain mutation, indexing action, or Theme/Form work occurred.
