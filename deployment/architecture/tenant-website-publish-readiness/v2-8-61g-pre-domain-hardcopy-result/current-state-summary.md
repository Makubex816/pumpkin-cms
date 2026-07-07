# Current State Summary

V2.8.61G created the current pre-domain-cutover master operator hardcopy outside the repo.

Current live state:

- Azure subscription: `Azure subscription 1`, `ff887def-fd83-4a19-9298-13d4b1687873`.
- Operator account: `Contact@iceskatingrinkrentals.com`.
- Tenants: `ice-rink-rentals`, `airstrip-club-las-vegas`.
- Admin users: 3 total, including 1 SuperAdmin and 2 TenantAdmin users.
- Airstrip production default host: `https://app-airstrip-prod-centralus-001.azurewebsites.net`.
- Airstrip custom domain: not cut over.
- Airstrip DomainBinding: `pending_dns_records`.
- Runtime no-regression: 17/17 GET checks passed.

Repo reports are redacted. Raw credentials, keys, tokens, connection strings, publishing credentials, and appsetting values exist only in the outside hardcopy.
