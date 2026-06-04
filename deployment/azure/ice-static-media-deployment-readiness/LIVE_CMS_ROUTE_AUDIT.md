# Live CMS Route Audit

## Approved Routes

| Route | Local URL | Probe Result | Marker Result |
| --- | --- | --- | --- |
| `/` | `http://localhost:3002/` | 200 | PPEC marker present |
| `/contact` | `http://localhost:3002/contact` | 200 | contact/form marker present |
| `/service-areas` | `http://localhost:3002/service-areas` | 200 | service-area marker present |

`contactus@` was absent from all three probed public routes.

## CMS Readback State

| Page | Published | Sitemap | Workflow | Review | Static Eligible | Needs Rebuild |
| --- | --- | --- | --- | --- | --- | --- |
| home | true | true | published | approved | true | true |
| contact | true | true | published | approved | true | true |
| service-areas | true | true | published | approved | true | true |

## Readback Sources

- `content-review/ice-approved-homepage-live-cms-promotion/homepage-readback-after-live-cms-promotion.json`
- `content-review/ice-final-contact-live-cms-promotion/contact-readback-after-live-promotion.json`
- `content-review/ice-service-areas-live-cms-promotion/service-areas-readback-after-live-promotion.json`

## Route Readiness Result

The live CMS routes are approved and reachable locally. They are not yet ready for static staging export because the static route expectations and generated snapshots still reflect the older route set.

