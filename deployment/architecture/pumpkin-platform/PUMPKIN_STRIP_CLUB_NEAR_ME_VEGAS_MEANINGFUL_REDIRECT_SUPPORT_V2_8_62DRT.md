# Strip Club Near Me Vegas Meaningful Redirect Support V2.8.62DRT

## Source Intent

The package contains three meaningful moved-page declarations. One is already persisted in the page-owned model. Two remain future TenantRedirect records:

| Source | Target | Status |
| --- | --- | ---: |
| `/guides/couples-night` | `/guides/couples-guide-vegas` | 301 |
| `/guides/dress-code-what-to-expect` | `/guides/dress-code` | 301 |

Both source and target routes exist. Source evidence includes zero-delay refresh, canonical target, moved-page text, and target link. Neither mapping is a no-op or accepted deviation.

## DRT Result

The generic model and local validation support both mappings. The actual dry-run has 3 declarations, 1 existing no-op, 2 create actions, 0 blocked items, and 0 cycles.

The one DRT API deployment activated the routes, but live Linux validation returned `400` for both payloads because leading-slash routes were misclassified as absolute file URIs. Source now contains the cross-platform correction and passes focused tests/build, but that correction is not deployed.

## Live State

Vegas remains at 43 pages, 1 page-owned redirect, 0 generic redirects, 302 media assets, 473 aliases, 32 FormDefinitions, 65 mappings, 1 theme, 1 TenantAdmin, and zero domain/import/publish records. All content remains unpublished/noindex/no-post.

## DRU Gate

V2.8.62DRU may create the two records only after a separately approved corrected API deployment and two live non-mutating validation responses with HTTP `200`, `valid: true`, `persistable: true`, resolved targets, explicit page shadows, and zero cycles.

No direct Cosmos/Mongo repair is permitted.
