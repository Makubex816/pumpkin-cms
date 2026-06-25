# V2.8.19G Isolated Staging Preview Deployment and Runtime QA Result

Date: 2026-06-25

Status: complete.

This package records the isolated staging preview deployment and bounded runtime QA for the recovered IceSkatingRinkRentals.com public website.

Approved target:

- `swa-ice-static-isolated-staging` in `rg-ice-static-staging`
- Default host: `https://kind-island-0a85a740f.7.azurestaticapps.net`

Explicitly excluded target:

- `swa-ice-static-staging`
- Reason: production-bound target with `iceskatingrinkrentals.com` and `www.iceskatingrinkrentals.com` custom domains attached and Ready.

Deployment summary:

- Sanitized build run: `sanitized_20260625060958`
- Artifact file count: 41
- Artifact aggregate SHA-256: `4c0f5e7babc104c8223ddfdc37d95dd863190796db809544d4e9e3acf44e9897`
- Deployment attempts sent: 1
- Deployment result: success
- Runtime route checks: `/`, `/service-areas`, and `/contact` returned 200 on the isolated default host.

No production-bound deployment, production-domain route check, DNS/custom-domain mutation, Search Console/indexing action, Azure media mutation, contact form POST, or protected config content read occurred.
