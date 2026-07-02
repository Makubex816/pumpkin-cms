# Static Export Feasibility Result

Decision: not feasible as-is.

Evidence:

- Uploaded `next.config.js` does not set static export output.
- App contains dynamic `/sitemap.xml` route with `force-dynamic`.
- App contains dynamic catch-all route `/[...slug]`.
- Temporary copied-workspace static export adapter failed during page data collection for `/sitemap.xml`.

Adapter test result:

| item | result |
| --- | --- |
| Test location | `.tmp/v2-8-56/source-build/` copied workspace only |
| Temporary config change | `output: export` and unoptimized images |
| Result | Failed |
| Failure class | dynamic_route_blocks_static_export |
| Copied config restored | Yes |

Static export would require a later source refactor to replace dynamic sitemap/catch-all behavior with static generation or remove those routes for the export target.

