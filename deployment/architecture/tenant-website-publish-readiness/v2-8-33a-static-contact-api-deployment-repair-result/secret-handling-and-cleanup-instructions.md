# Secret Handling And Cleanup Instructions

Secret handling performed:

- Approved secure file read only from `.tmp/v2-8-33a/secure/static-contact-api-deploy-repair.json`.
- Admin password held only in process memory for login.
- Admin bearer token held only in process memory for readback.
- SWA deployment token retrieved only into process memory for the isolated deploy.
- Deployment token was not passed as a command argument.
- Deployment token was not printed, persisted, exported, or written.
- Secret values were not written to this result package.

Cleanup reminders:

- Do not stage `.tmp/`.
- Do not stage the approved secure file.
- Do not copy the secure file into any result package.
- Remove ignored runtime artifacts under `.tmp/v2-8-33a/` when no longer needed.
