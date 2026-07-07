# Executive Owner Resource Summary

The Pumpkin platform currently has one Azure subscription with 8 resource groups and 29 visible resources.

The resources fall into six owner-friendly groups:

1. Live production platform:
   - Pumpkin API;
   - standalone Admin UI;
   - shared App Service plan;
   - production Cosmos account;
   - production media storage.

2. Live Ice public website:
   - Ice Static Web App;
   - Ice apex and www custom domains;
   - static contact health endpoint.

3. Airstrip tenant runtime:
   - production App Service default host;
   - isolated preview App Service;
   - Airstrip media container;
   - pending custom-domain/DNS cutover.

4. Isolated/staging/proof:
   - Ice isolated Static Web App;
   - Admin UI isolated App Service.

5. Monitoring:
   - Log Analytics workspace;
   - ops action group;
   - six metric alerts.

6. Legacy/deferred or cleanup candidates:
   - old static-contact Function App resources;
   - older outbound-link-manager staging resources.

Owner instruction:

- Do not delete production, isolated, monitoring, media, or Cosmos resources.
- Do not delete legacy/deferred resources until a future dependency-proof decommission phase proves they are unused.
- Do not stage or copy off-repo backup, hardcopy, tenant package, or proof output folders.
- Do not treat this atlas as a secret hardcopy; it intentionally omits raw secrets.
