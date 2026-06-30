# Next Phase Prompt

Approve V2.8.51 Secondary Tenant Package Dry-Run Intake only.

Use V2.8.50 as carryforward. The next phase may read an uploaded public candidate tenant package and run the V1 validator locally. It may not create a tenant, create Roller, mutate Ice, upload media, deploy, mutate appsettings, mutate DNS/custom domains, run Search Console/indexing, submit forms, send contact POSTs, direct-write Cosmos, read protected config, or print/write secrets.

Required inputs:

- Public candidate package following `deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/`.
- Optional separate secure handoff for presence/shape validation only, if approved.

Required outputs:

- Validator result.
- Secret-scan result.
- Gap report by module.
- Tenant creation readiness classification.
- Exact next approval prompt for tenant creation only if dry-run passes.

Hard stops:

- Secret value found in public package.
- Missing tenant ID.
- Missing baseline pages.
- Missing TenantAdmin handoff plan.
- Missing media references when media assets are declared.
- Any request requiring live mutation without separate approval.
