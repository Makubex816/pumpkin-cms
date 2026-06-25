# Static Web Apps Config Analysis

Result: no local SWA route config found for `/api/contact`.

Search result:

- No `staticwebapp.config.json` file was found in inspected repo paths excluding protected config, `node_modules`, and `.next`.
- No local SWA config evidence was found that rewrites `/api/contact` to an external static endpoint.
- No local SWA config evidence was found that includes a managed Functions API with the selected static artifact.

Package/build shape:

- `apps/ice-rink-web/package.json` builds static Ice output with `PUMPKIN_RENDER_MODE=static`.
- `apps/ice-rink-web/next.config.js` uses `output: 'export'` in static render mode.
- V2.8.19H deployed only the selected sanitized frontend `out` folder.

Boundary:

- No Azure Static Web Apps settings were mutated.
- No app settings were read or changed.
- No protected deployment tokens were listed, printed, reset, exported, or used.

Conclusion:

- The 405 was not traced to a source-level `staticwebapp.config.json` route conflict.
- The available evidence points to missing deployed API/static endpoint, not a misconfigured local SWA route file.
