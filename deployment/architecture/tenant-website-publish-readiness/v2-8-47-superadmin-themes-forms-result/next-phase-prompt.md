# Next Phase Prompt

Approve V2.8.48 Standalone FormDefinition API/Admin UI Lifecycle Implementation and Roller Onboarding Readiness only.

Carry forward V2.8.47:

- Spectre Dev SuperAdmin exists and login/verify proof passed.
- Theme container `Theme` exists with `/tenantId`.
- Theme API lifecycle passed with no synthetic residual.
- Admin UI Themes route is production-available.
- Admin UI Form Builder route is production-available but page/default-definition based.
- Standalone FormDefinition API/service/storage lifecycle is not implemented.

Allowed V2.8.48 scope should be limited to:

- Source-design standalone FormDefinition storage contract.
- Source-confirm container name and partition key before any container creation.
- Implement FormDefinition service methods, Admin CRUD routes, public read route if needed, and tests.
- Implement Admin UI Form Builder integration with standalone FormDefinition API if scoped.
- Deploy Pumpkin API once only if tests pass and deployment is explicitly approved.
- Deploy Admin UI isolated then production only if source changes require it and approval includes those steps.
- Run exactly one synthetic non-contact FormDefinition lifecycle proof with cleanup.

Hard stops:

- No contact form submission.
- No DNS/custom-domain mutation.
- No indexing action.
- No appsetting mutation unless separately approved.
- No storage key/listKeys/SAS action.
- No protected config reads outside an approved secure handoff.

Exact-path commit instructions for V2.8.47:

```powershell
git add PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_47_SUPERADMIN_THEMES_FORMS_REPORT.md
git add deployment/architecture/tenant-website-publish-readiness/v2-8-47-superadmin-themes-forms-result/
git commit -m "Add V2.8.47 SuperAdmin themes forms proof"
```
