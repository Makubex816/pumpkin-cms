# Deployment Artifact Completeness Manifest

Manifest: `apps/starter-app/deployment/tenant-artifacts.json`.

It records each tenant ID, fixture format/path/hash, route count, required theme/public assets, host inventory, and form mode. It also records the registry and host metadata package paths.

Source verification passed for both tenants. Negative tests proved fail-closed behavior for:

- missing Party Pros fixture;
- missing Vegas theme asset;
- missing Party Pros registry entry.

Package preparation copies only manifest-declared fixture files and verifies the resulting standalone tree.
