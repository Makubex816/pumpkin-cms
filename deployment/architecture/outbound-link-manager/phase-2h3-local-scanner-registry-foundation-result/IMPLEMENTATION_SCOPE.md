# Implementation Scope

Implemented:

- Node `.mjs` CLI;
- local fixture scanner;
- URL extractor for declared fields, bare URLs, markdown links, and HTML-like anchors;
- URL normalizer;
- domain normalizer;
- registry builder;
- instance tracker;
- scan-run writer;
- scan report writer;
- validator;
- required fixture matrix;
- Node tests;
- operator docs.

Out of scope and not performed:

- database migration;
- schema migration execution;
- CMS writes;
- MediaAsset writes;
- Admin UI implementation;
- Pumpkin API implementation;
- production renderer integration;
- external HTTP crawling;
- live link health checks;
- protected config reads;
- Azure/CMS/API mutations;
- deployment;
- Search Console/indexing;
- live-page publication.
