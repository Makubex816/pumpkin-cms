# Next Phase Prompt

Use this prompt for the next isolated staging preview phase only.

```text
Approve V2.8.19G Isolated Staging Preview for IceSkatingRinkRentals.com only.

Use the completed V2.8.19F existing Azure media source integration result package and the locally validated `apps/ice-rink-web` source to create an isolated staging preview for `/`, `/service-areas`, and `/contact`.

Approved in V2.8.19G:
- Run start-state checks.
- Reuse the V2.8.19F source integration and result package.
- Run protected-config-safe local validation and static build/generate.
- Deploy only to `swa-ice-static-isolated-staging` if the approval packet confirms that this target is isolated and not production-bound.
- Verify the isolated staging preview routes visually and functionally without production crawling.
- Confirm existing Azure Blob media renders from `https://iceskatingmedia.blob.core.windows.net/ice-rink-rentals-media/ice-rink-rentals/assets/`.
- Confirm public display/mailto email is `contact@iceskatingrinkrentals.com`.
- Produce an isolated staging preview result package, owner review checklist, and production-bound go/no-go packet.

Not approved in V2.8.19G:
- No deploy to `swa-ice-static-staging`.
- No production deploy.
- No DNS/custom-domain mutation.
- No Search Console/indexing.
- No sitemap submission.
- No URL Inspection API.
- No Google Indexing API.
- No Azure media upload.
- No Azure mutation.
- No blob upload, copy, delete, or rename.
- No deployment-token reset/print/use.
- No protected config read or print.
- No contact-form POST.
- No production crawl.
- No live publication.

Acceptance:
- Isolated staging preview exists only on `swa-ice-static-isolated-staging`.
- Production-bound target remains untouched.
- Owner visual/content review checklist exists.
- Exact production-bound approval prompt is produced only after isolated staging review.
```
