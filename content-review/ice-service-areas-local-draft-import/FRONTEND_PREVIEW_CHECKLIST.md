# Frontend Preview Checklist

Frontend probes are opportunistic local checks only; browser visual approval is still required before static or production work.

| Route | URL | Reachable | HTTP status | Response length |
| --- | --- | --- | --- | --- |
| serviceAreas | http://localhost:3002/service-areas | yes | 404 | 9671 |
| homepagePreview | http://localhost:3002/__preview/ice-rink-rentals/home | yes | 200 | 28660 |
| contact | http://localhost:3002/contact | yes | 200 | 48798 |

Manual review targets:

- `http://localhost:3002/service-areas`
- `http://localhost:3002/__preview/ice-rink-rentals/home`
- `http://localhost:3002/contact`
