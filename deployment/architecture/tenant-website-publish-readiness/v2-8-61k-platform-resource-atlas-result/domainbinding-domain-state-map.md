# DomainBinding And Domain State Map

Ice:

| domain | resource | currentState | evidence | actionNeeded |
| --- | --- | --- | --- | --- |
| iceskatingrinkrentals.com | swa-ice-static-staging | Ready | Azure Static Web App hostname metadata; GET 200 | none |
| www.iceskatingrinkrentals.com | swa-ice-static-staging | Ready | Azure Static Web App hostname metadata; GET 200 | none |

Airstrip:

| domain | resource | currentState | evidence | actionNeeded |
| --- | --- | --- | --- | --- |
| airstripclublasvegas.com | app-airstrip-prod-centralus-001 | not_bound_in_azure_metadata | V2.8.61 docs; App Service hostnames show default Azure host only | manual owner DNS action and later approved Azure binding |
| www.airstripclublasvegas.com | app-airstrip-prod-centralus-001 | not_bound_in_azure_metadata | V2.8.61 docs; App Service hostnames show default Azure host only | manual owner DNS action and later approved Azure binding |

Important Airstrip notes:

- V2.8.61K did not run Airstrip route probes.
- V2.8.61K did not mutate DNS, Azure hostname binding, managed TLS, nameservers, Google Workspace records, CDN, Front Door, or indexing.
- V2.8.61 manual owner DNS values are intentionally not repeated in this atlas; use the V2.8.61 owner packet for exact DNS entry values.
- V2.8.61G reported the Airstrip DomainBinding status as pending DNS records, with Azure hostname and TLS not started.
