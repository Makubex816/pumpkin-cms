# Static Publish Pipeline Discovery

Relevant scripts:

- `apps/ice-rink-web/scripts/snapshot-cms-content.mjs`
- `apps/ice-rink-web/scripts/static-publish.mjs`
- `apps/ice-rink-web/scripts/sanitized-static-build.mjs`
- `deployment/static-azure/validate-static-output.mjs`
- `deployment/static-azure/validate-staging-package.mjs`

The live proof used CMS snapshot mode with an admin token in process only. The proof build allowed exactly the generated proof slug and proof noindex path. Cleanup and production builds did not set the proof allowlists.
