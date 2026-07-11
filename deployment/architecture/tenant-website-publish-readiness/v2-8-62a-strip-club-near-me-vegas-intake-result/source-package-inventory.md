# Source Package Inventory

Inner static site:

- files: 552;
- directories: 68;
- bytes: 40,849,787;
- HTML pages: 43;
- CSS files: 2;
- JavaScript files: 1;
- JSON files: 13;
- image files: 473;
- XML files: 1;
- Markdown files: 1;
- protected-config filenames: 0;
- package manifest or package manager metadata: absent.

Content model:

- home: 1;
- club directory: 1;
- club details: 10;
- guide hub: 1;
- guide articles: 19;
- SEO landing pages: 7;
- policy pages: 2;
- contact: 1;
- 404 system page: 1;
- dynamic routes: 0;
- dedicated gallery routes: 0;
- dedicated blog/news routes: 0; the guide hub and guide articles provide the editorial corpus.

Structured data includes `data/clubs.json` with 10 records and source fields for identity, venue age policy, location, hours, media, public venue phone, public website, and descriptive planning metadata. Internal QA JSON/TXT files and a sitemap are also present.

The sole script is `assets/js/main.js`, a 17,302-byte non-module vanilla browser script. Static inspection found menu/navigation, filtering/search, one local JSON fetch, local-storage lead handling, and form-submit interception. It was not executed.

All 45 broken local references belong to one legacy top-level route. The corresponding guide article is separate and intact. One visible guide-count claim also exceeds the 19 actual guide article routes and must be normalized in compilation.
