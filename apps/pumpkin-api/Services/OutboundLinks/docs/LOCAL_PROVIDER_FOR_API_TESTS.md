# Local Provider For API Tests

Phase 2H-9 adds `FakeOutboundLinkReadOnlyProvider`.

The provider is local/fake only and contains deterministic fixture data:

- tenant: `fixture-tenant`
- site: `fixture-site`
- links: 5
- instances: 5
- policies: 1
- scan runs: 1
- audit logs: 1
- domains: 3

The fake provider does not:

- read protected config
- read local `.tmp` artifacts
- call CMS/API endpoints
- call Azure, Cosmos, Storage, Cloudflare, or Search Console
- crawl external URLs
- perform live link health checks
- write CMS data

It exists so the GET endpoint foundation can compile, run, and test without production persistence.

