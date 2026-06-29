# App Service Package Shape Analysis

The V2.8.37 package contained the expected standalone artifacts but was created with Windows-style ZIP entries.

Required App Service package shape for this Linux App Service target:

- Root `server.js`.
- Root `package.json`.
- `.next/server`.
- `.next/static`.
- Runtime `node_modules` required by the standalone server.
- Forward-slash ZIP entry paths.
- No protected env files.

V2.8.37A rebuilt the ZIP with explicit forward-slash entry creation. This package shape was proven locally, then in isolated Azure App Service, then on the production default host.
