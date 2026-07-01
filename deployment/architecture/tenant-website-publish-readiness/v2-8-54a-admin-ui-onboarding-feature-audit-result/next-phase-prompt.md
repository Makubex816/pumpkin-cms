# Next Phase Prompt

Use this prompt only after the partner provides the updated approved real tenant package.

```xml
<codexTask id="v2-8-55-real-tenant-package-readonly-preflight-admin-ui-gap-aware">
  <repo>C:\Users\User\Desktop\PumpkinCMS\pumpkin-cms</repo>
  <branch>feature/admin-page-editor-import-export</branch>
  <userApproval>
    Approve V2.8.55 Real Tenant Package Read-Only Preflight only.

    Carry forward V2.8.54A. Do not create a tenant, do not use the old secondary package, do not mutate live records, do not submit forms, do not contact POST, do not upload media, do not deploy, do not mutate Azure/appsettings/DNS/indexing, do not run key-listing operations, do not generate SAS values or provider connection material, do not print credential values, do not stage .tmp, and do not use blanket all-file staging.

    Use the new partner-provided real tenant package path only after it is explicitly named in this approval. Validate the package against the V2.8.50 package contract, map it to the V2.8.54A Admin UI feature coverage matrix, confirm V2.8.53S external compatibility constraints, and produce a no-mutation creation readiness decision.
  </userApproval>
  <carryforward>
    <item>V2.8.54A completed read-only feature audit.</item>
    <item>/dashboard/leads is a known route gap; current Leads/FormEntry route is /dashboard/forms.</item>
    <item>Tenant creation remains blocked until partner package, secure handoff, and live mutation approval are all present.</item>
    <item>External SDI-AI contract remains immutable.</item>
  </carryforward>
</codexTask>
```
