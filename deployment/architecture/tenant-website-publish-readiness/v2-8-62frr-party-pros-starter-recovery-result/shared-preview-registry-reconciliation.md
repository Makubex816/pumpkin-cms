# Shared Preview Registry Reconciliation

`preview-fixture-registry.json` now declares both tenants:

- `party-pros-philadelphia`: structured fixture, 301 routes;
- `strip-club-near-me-vegas`: package-static fixture, 43 routes and 3 redirects.

`host-tenant-routes.json` declares Party Pros apex and `www` hosts with `preview-fixture` source and `live-submit` public form mode. Vegas remains preview-only with no public host mapping.

Runtime host routing imports committed metadata while retaining the existing environment override path.
