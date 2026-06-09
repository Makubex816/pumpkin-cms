# Non-Goals

Phase 2F-7 explicitly does not authorize:

- real backup export;
- backup bundle creation from live Ice data;
- production backup zip creation;
- database export or import;
- SQL BACPAC export;
- CMS/API calls;
- CMS writes;
- MediaAsset writes;
- blob or media download;
- static output export from production;
- protected config reads;
- secret value reads;
- secret export;
- encrypted escrow payload creation;
- escrow restore;
- restore into any real system;
- Azure changes;
- Cloudflare changes;
- DNS changes;
- deployment;
- Function App setting changes;
- email or Microsoft 365 work;
- Search Console submission, sitemap submission, URL Inspection, or indexing request;
- Admin UI implementation;
- live-page publication.

Raw `content-review` inputs and ignored generated output remain outside this package.
