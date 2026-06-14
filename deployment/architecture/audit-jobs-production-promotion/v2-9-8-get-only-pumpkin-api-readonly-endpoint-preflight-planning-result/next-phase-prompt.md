# Next Phase Prompt

Approve V2.9.9 GET-Only Pumpkin API Read-Only Endpoint Implementation only.

Scope:

- implement the fixture-backed GET-only Pumpkin API Audit Jobs endpoint family planned in V2.9.8;
- add DTOs, read-only envelope contracts, a fixture-backed read-only provider, service, authorization guard, and minimal API route group under `/api/admin/audit-jobs`;
- register only GET routes:
  - `/api/admin/audit-jobs/viewer-summary`;
  - `/api/admin/audit-jobs/events`;
  - `/api/admin/audit-jobs/job-runs`;
  - `/api/admin/audit-jobs/promotion-gates`;
  - `/api/admin/audit-jobs/evidence-bindings`;
  - `/api/admin/audit-jobs/traces`;
  - `/api/admin/audit-jobs/blockers`;
  - `/api/admin/audit-jobs/next-gates`;
- use the V2.9.6 read-only API envelope fixture as the initial provider source;
- keep provider mode explicit and read-only;
- require tenant/site query scope and Admin authorization;
- add local fixture-backed API tests and no-write route scans;
- validate Admin compatibility but do not switch Admin to live API by default unless explicitly included in the approval;
- update docs, result package, root report, and control docs.

Hard stops:

- no POST, PUT, PATCH, DELETE routes;
- no live provider data wiring;
- no provider writes;
- no CMS writes;
- no deployment/redeployment;
- no DNS/custom-domain mutation;
- no Google/Search Console/indexing action;
- no contact-form submission or contact endpoint POST;
- no Azure infrastructure/configuration/app settings mutation;
- no RBAC assignment;
- no protected config reads;
- no deployment/OAuth token use, print, export, listing;
- no Key Vault secret queries;
- no keys/listKeys;
- no connection string or SAS generation;
- no Electron runtime implementation.

