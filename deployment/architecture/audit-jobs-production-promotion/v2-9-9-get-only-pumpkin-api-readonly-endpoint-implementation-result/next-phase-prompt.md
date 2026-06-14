# Next Phase Prompt

Approve V2.9.10 Admin-to-Pumpkin-API Read-Only Bridge Planning only.

Scope:

- review V2.9.9 GET-only Pumpkin API Audit Jobs implementation;
- review V2.9.7 Admin contract adapter and local fixture provider;
- plan how Admin can consume `/api/admin/audit-jobs/*` without changing read-only behavior;
- define provider switch strategy, feature boundary, fallback behavior, request/response contract checks, and QA;
- keep Admin fixture-backed behavior as the default until a later implementation approval;
- create bridge plan, result package, root report, and control-doc updates.

Hard stops:

- no Admin-to-API runtime bridge implementation unless explicitly approved;
- no Electron runtime;
- no live provider integration;
- no CMS/provider writes;
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
- no connection string or SAS generation.

