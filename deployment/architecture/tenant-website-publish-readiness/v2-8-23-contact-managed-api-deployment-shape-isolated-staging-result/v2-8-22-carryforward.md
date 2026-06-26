# V2.8.22 Carryforward

V2.8.22 proved that the frontend/static artifact remediation worked:

- Ice static builds defaulted to `/api/static-contact`.
- Runtime CMS mode stayed on `/api/contact`.
- `/contact` on isolated staging returned 200.
- The isolated contact page contained `/api/static-contact`.
- The single isolated POST returned HTTP 404 with an empty body.

Carryforward interpretation:

The frontend/static artifact was corrected, but the SWA managed API route was not live after deployment.

