# Pumpkin Airstrip Public Page Readiness V2.8.59

V2.8.59 repaired the V2.8.58D public page blocker.

Previous blocker:

`public_page_api_blocked_by_unpublished_airstrip_pages`.

Repair:

- Published the 5 Airstrip pages.
- Included the 5 Airstrip pages in sitemap readiness.
- Cleared `staticPublishing.needsRebuild`.
- Marked static publishing deployment status as `isolated_preview_ready`.

Public page API proof:

- `home`: HTTP 200.
- `contact`: HTTP 200.
- `packages`: HTTP 200.
- `request-booking`: HTTP 200.
- `service-areas`: HTTP 200.

The returned CMS page JSON remained tenant-scoped to Airstrip and contained Airstrip Blob media references.
