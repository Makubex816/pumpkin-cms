# Current State Summary

Airstrip production cutover is complete for the App Service default host and pending for the custom domains.

- Default host: `https://app-airstrip-prod-centralus-001.azurewebsites.net`.
- Default-host route proof: passed.
- Production screenshots: captured outside repo.
- Custom domains: not bound; Bluehost DNS owner action required.
- Bluehost DNS packet: generated with exact App Service A/CNAME/TXT values.
- Airstrip page deployment metadata: updated on 5 Airstrip pages.
- Ice runtime: no regression observed.
- Google Workspace email DNS: not activated.
- CDN/Front Door: not used.
- Indexing: excluded and not performed.
