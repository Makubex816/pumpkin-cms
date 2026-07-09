# New Tenant Owner Values Template Summary

Template path:

`.tmp/v2-8-61o/owner-input/new-tenant-intake-owner-values.json`

Status:

- Created.
- Ignored by `.gitignore` through `.tmp/`.
- Not staged.
- Contains no secrets.

Purpose:

- Gives the owner a structured place to provide the new tenant inputs for a later approval.
- Keeps TenantAdmin password material out of the repo by using a boolean confirmation only.

Default policy encoded:

- DNS strategy defaults to provider records only with no nameserver change.
- Custom-domain cutover defaults to false.
- Contact POST proof defaults to false.
- Tenant creation and media upload approvals default to false.
