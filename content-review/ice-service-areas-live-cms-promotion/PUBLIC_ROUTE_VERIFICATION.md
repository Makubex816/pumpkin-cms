# Public Route Verification

| Route | URL | Status | Reachable |
| --- | --- | --- | --- |
| serviceAreasPublic | http://localhost:3002/service-areas | 200 | yes |
| serviceAreasPreview | http://localhost:3002/__preview/ice-rink-rentals/service-areas | 200 | yes |
| homepage | http://localhost:3002/ | 200 | yes |
| contact | http://localhost:3002/contact | 200 | yes |

Expected public /service-areas result after CMS live promotion: HTTP 200 if the public frontend reads live CMS pages. If 404 appears, restart/cache behavior should be checked before content is reworked.
