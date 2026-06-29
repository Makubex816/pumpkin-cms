# Secret Handling And Cleanup Instructions

Secret handling performed:

- Approved secure file read only from `.tmp/v2-8-33b/secure/static-contact-upstream-probe-repair.json`.
- Admin password held only in process memory for login.
- Admin bearer token held only in process memory for readback.
- Provider connection string held only in process memory for the tenant-key alignment helper.
- Static contact API key held only in process memory for probes, appsetting repair, and tenant alignment.
- Secret values were not printed or written.
- The secure file was not copied.
- SWA CLI generated package-local `.env` files during deploy; they were removed without being read.

Cleanup reminders:

- Do not stage `.tmp/`.
- Do not stage `.tmp/v2-8-33b/secure/*`.
- Do not stage `.tmp/v2-8-33b/tenant-key-aligner/`.
- Do not stage `.tmp/v2-8-33b/artifacts/`.
