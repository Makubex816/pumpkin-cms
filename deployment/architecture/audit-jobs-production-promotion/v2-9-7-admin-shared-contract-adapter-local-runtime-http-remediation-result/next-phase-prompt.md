# Next Phase Prompt

Approve V2.9.8 GET-Only Pumpkin API Read-Only Endpoint Preflight Planning only.

Scope:

- keep work local/read-only unless a later prompt explicitly approves an exact runtime implementation;
- review V2.9.6 read-only API envelope contract and V2.9.7 Admin adapter/runtime remediation result;
- plan the future GET-only Pumpkin API route/controller shape for Audit Jobs without implementing the endpoint yet;
- define authorization, tenant/site context, no-write guards, response envelope mapping, redaction rules, validation checks, and failure modes;
- document how Admin will switch from local fixture adapter to future GET-only API provider behind an explicit gate;
- document Electron as future and still unimplemented;
- run local docs/contract validation and no-write scans;
- create V2.9.8 result package, root report, and control-doc updates.

Hard stops:

- no live API endpoint implementation;
- no Pumpkin API runtime endpoint implementation;
- no Electron runtime implementation;
- no deployment/redeployment;
- no DNS or custom-domain mutation;
- no Google/Search Console/indexing action;
- no sitemap submission through Google;
- no URL Inspection API or Google Indexing API;
- no indexing request;
- no crawl or outbound live URL check;
- no contact-form submission or contact endpoint POST;
- no CMS/provider writes;
- no Azure infrastructure/configuration/app settings mutation;
- no RBAC assignment;
- no protected config reads;
- no token/key/connection-string/SAS use, print, export, listing, query, or generation.

