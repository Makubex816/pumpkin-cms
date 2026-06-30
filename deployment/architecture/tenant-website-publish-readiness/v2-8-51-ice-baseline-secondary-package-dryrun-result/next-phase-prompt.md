# Next Phase Prompt

Approve V2.8.52 Secondary Tenant Package Intake Validation and Controlled Creation Readiness only.

Use the completed V2.8.51 result package and require a full-template secondary candidate package at:

`C:\Users\User\Desktop\PumpkinCMS\tenant-onboarding-intake\secondary-candidate`

Scope:

- Validate the secondary package with the V2.8.50 tenant package validator.
- If the package is a ZIP, extract only into ignored `.tmp/v2-8-52/secondary-package/`.
- Run public package secret scans.
- Verify tenantId consistency.
- Verify required modules: tenant, users, pages, media, theme, forms, contact, importExport, publish, monitoring, validation.
- Verify baseline routes: home, contact, service areas, or explicit equivalents.
- Verify default quote request FormDefinition or approved equivalent.
- Verify media manifest references only public paths/URLs and does not upload media.
- Verify admin users use `passwordSource` and contain no password values.
- Produce a controlled secondary tenant creation approval packet only if validation passes.

Hard stops:

- Do not create the secondary tenant unless a separate approval explicitly allows creation.
- Do not create Roller unless explicitly approved.
- Do not upload media.
- Do not deploy.
- Do not mutate appsettings.
- Do not mutate DNS/custom domains.
- Do not run Search Console/indexing.
- Do not submit forms or contact POSTs.
- Do not print or write secrets.
- Do not stage `.tmp`.
- Do not use `git add -A`.

