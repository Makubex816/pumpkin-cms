# Next Phase Prompt

Continue with V2.8.37A Admin UI isolated deployment repair only.

Carry forward:

- V2.8.37 source build passed.
- Standalone Admin artifact served locally.
- Isolated App Service target exists:
  `app-pumpkin-admin-isolated-centralus-001`
- Isolated OneDeploy attempt failed with HTTP 400 and deployment ID `45998942-bc56-47ff-a3a0-976e76c1a3ed`.
- Isolated default host returned 503.
- Admin API read-only proof passed with `TenantAdmin` scoped to `ice-rink-rentals`.
- Production Admin UI deployment was not attempted.

Approved scope requested:

1. Read only the approved secure file if still needed.
2. Inspect detailed Kudu deployment logs without printing credentials.
3. Repair only the isolated Admin UI deployment method or package shape.
4. Do not create or deploy production until isolated default host returns 200 for `/` and `/login`.
5. Reuse live Pumpkin API base URL.
6. Do not write tenant/page/content/media/import/publish documents.
7. Do not send contact POSTs.
8. Do not mutate DNS/custom domains.
9. Do not run Search Console/indexing.
10. Do not perform Theme/Form/FormDefinition work.
11. Do not print or write secrets/tokens/cookies.

Acceptance:

- Isolated Admin UI default host serves `/` and `/login`.
- Built/deployed Admin UI uses live Pumpkin API, not localhost API.
- Admin API read-only proof remains passing.
- Production deployment remains hard-stopped until separately approved or until this prompt explicitly approves it after isolated proof.
