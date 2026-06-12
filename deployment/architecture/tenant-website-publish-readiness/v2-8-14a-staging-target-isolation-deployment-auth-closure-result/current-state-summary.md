# Current State Summary

V2.8.14A is complete and classified `blocked_auth_missing`.

Complete:

- The old target `swa-ice-static-staging` is confirmed blocked because it has production custom domains attached.
- A new isolated non-production target exists: `swa-ice-static-isolated-staging`.
- The isolated target default hostname is `kind-island-0a85a740f.7.azurestaticapps.net`.
- The isolated target has no custom domains.
- The SWA CLI can be used through a pinned repo-supported `npx` invocation.
- The sanitized Ice static artifact validates.

Not ready:

- `SWA_CLI_DEPLOYMENT_TOKEN` is absent from the current terminal session.
- Static deployment remains unperformed.
- DNS, indexing, live publication, and production-domain use remain closed.

