# Non-Goals

Phase 2E-3 does not:

- create a CMS tenant;
- import content into CMS;
- update existing CMS pages;
- create `service-areas`;
- write MediaAsset records;
- create or update form-recipient records;
- change SEO, sitemap, robots, canonical, published, or live-page state;
- run CMS/API calls;
- use env vars or secrets;
- read protected config;
- perform POST, PUT, PATCH, or DELETE requests;
- modify Azure, Cloudflare, DNS, Function App settings, deployment, email, Microsoft 365, Search Console, or indexing;
- stage files;
- publish live pages.

The package does not make Roller production-ready. It prepares a later write-preflight decision.
