# V2.8.60 Carryforward

V2.8.60 completed Airstrip production default-host cutover:

- Production App Service: `app-airstrip-prod-centralus-001`.
- Production default host: `https://app-airstrip-prod-centralus-001.azurewebsites.net`.
- Required Airstrip routes returned HTTP 200.
- Bluehost DNS owner action was still required.
- Custom-domain binding was not complete.
- Google Workspace email DNS, CDN, Front Door, and indexing were out of scope.

V2.8.60R was opened because mobile visual screenshots showed overflow and clipped navigation before DNS/custom-domain binding.
