# Live / Local Boundary Map

| Area | Live status | Local/source status | Boundary finding |
| --- | --- | --- | --- |
| Public Ice static site | Live on `swa-ice-static-staging` | Source in `apps/ice-rink-web` | Production GET checks passed |
| Isolated Ice static site | Live on `swa-ice-static-isolated-staging` | Source in `apps/ice-rink-web` | Isolated GET checks passed |
| Static contact bridge | Live on SWA functions | Source in `deployment/static-azure/forms/static-form-endpoint-compat` | Health passed; tests passed |
| Pumpkin API | Live App Service | Source in `apps/pumpkin-api` | Health passed; API build passed in isolated output |
| Admin UI | Not found deployed | Source in `apps/admin` | Local-only; type-check passed |
| Cosmos production data | Live Cosmos account/database | Source expects singular model containers | Contact/auth containers present; broader CMS mismatch |
| Media files | Live Blob Storage | Media map in `apps/ice-rink-web/src/data/ice-rink-media.ts` | 9 live PNG blobs under approved prefix |
| Backup tooling | Prior source/packages exist | Backup implementation under architecture packages | Operational hardening remains |
| Monitoring | No diagnostics on core production resources | Staging OLM has App Insights/Log Analytics | Production observability gap |
