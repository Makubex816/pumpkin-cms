# V2.8.37 Carryforward

V2.8.37 established source/build readiness but stopped at the isolated App Service package deployment.

Carryforward points:

- `apps/admin/next.config.js` had been updated for standalone output.
- Admin dashboard text escaping fixes allowed type-check/build to pass.
- Local standalone serving passed.
- The existing isolated Web App was `app-pumpkin-admin-isolated-centralus-001`.
- The isolated Web App had `node server.js` startup and non-secret Admin UI runtime settings.
- The V2.8.37 package deploy failed with OneDeploy/Kudu HTTP 400.
- Isolated `/` and `/login` returned 503 after that failed deployment.
- Direct Admin API read-only proof showed a valid TenantAdmin login and expected tenant visibility.

V2.8.37A resumed from that blocked deployment state and repaired the package shape.
