# Google Indexing Deferred Carryforward

Status: deferred hard stop preserved.

V2.9.6 did not run Google Search Console, sitemap submission through Google, URL Inspection API, Google Indexing API, indexing request, crawl, or outbound live checks.

The contract validator requires:

- `summary.indexingState: deferred`;
- `indexing-deferred` panel with state `deferred`;
- `google-indexing-deferred` next gate.

Indexing remains future separately approved work.
