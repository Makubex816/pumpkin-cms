# Artifact Root Selection Result

Status: passed.

Selected artifact root:

```text
apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260613020714/repo/apps/ice-rink-web/out
```

Root selection basis:

- fresh V2.8.17A sanitized build output;
- canonical Ice routes present: `/`, `/service-areas`, `/contact`;
- `index.html`, `service-areas/index.html`, and `contact/index.html` present;
- `sitemap.xml` and `robots.txt` present;
- no `routes.json` present in the artifact root;
- no `.env.local` or protected config present in the artifact root.

The corrective command shape must be run from this artifact root if a future separately approved retry is authorized.
