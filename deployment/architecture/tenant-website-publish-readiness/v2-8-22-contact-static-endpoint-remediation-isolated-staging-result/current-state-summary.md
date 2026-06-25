# Current State Summary

V2.8.22 started from the V2.8.21 root-cause result: the production-bound static export did not ship the Next `/api/contact` route, and the static form endpoint was not configured in the selected artifact.

Current result:

- Static frontend source now defaults Ice static builds to `/api/static-contact`.
- Runtime CMS mode still uses `/api/contact`.
- The existing Azure Functions scaffold remains the selected static contact endpoint package.
- The sanitized static artifact contains `/contact`, `/service-areas`, `/`, and serializes `/api/static-contact` on `/contact`.
- The isolated SWA package included both `app/` and `api/`.
- The one approved isolated deployment succeeded.
- The one approved isolated POST returned 404 with an empty body.

Production remains closed. No production deploy or production contact POST occurred.
