# Next Approval Prompt

Approve V2.8.61OD recovery continuation only.

Use the existing partial live state:

- Do not recreate the tenant.
- Do not recreate TenantAdmin.
- Do not recreate or delete the media container.
- Do not rerun upload-batch.
- Do not perform deploy, DNS, contact POST, form submission, customer-facing POST, Airstrip action, Ice mutation, storage key/listKeys/SAS, appsetting mutation, or indexing.

Approved recovery work should:

1. Re-auth SuperAdmin.
2. Read back existing Party Pros partial state.
3. Fix only the contact page import payload to satisfy current form validation: consent field, honeypot field, and `tenantId`/`siteKey`/`formKey`/`sourcePage` hidden fields.
4. Create the remaining Party Pros pages.
5. Create the `627` Party Pros MediaAsset records pointing at the already uploaded blob URLs.
6. Run TenantAdmin login and tenant-scope proof.
7. Prove TenantAdmin cannot access SuperAdmin-only surfaces.
8. Prove Ice counts unchanged against the saved baseline.
9. Run non-Airstrip runtime no-regression.
10. Update the outside-repo hardcopy and repo-safe reports.
