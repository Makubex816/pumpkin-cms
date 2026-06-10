# Outbound Link Manager Local Scanner

Phase 2H-3 implements the first local/offline Outbound Link Manager scanner and registry foundation.

This package scans fake fixture JSON only. It extracts outbound web URLs, normalizes them, builds tenant/site-scoped `outbound_links` records, builds per-placement `outbound_link_instances`, writes a scan run summary, validates output, and produces local reports under ignored `.tmp`.

It does not crawl external links, call CMS/API/Azure services, write CMS data, run database migrations, implement Admin UI/API screens, deploy, index, or publish live pages.

## Quick Start

```powershell
npm run check
npm run scan:single
npm run scan:tenant-bundle
npm run validate:tenant-bundle
npm run inspect:tenant-bundle
```

## CLI

```powershell
node src/outbound-link-cli.mjs help
node src/outbound-link-cli.mjs scan --fixture fixtures/single-link.fixture.json --out .tmp/single-link-scan --overwrite
node src/outbound-link-cli.mjs validate --scan .tmp/single-link-scan
node src/outbound-link-cli.mjs inspect --scan .tmp/single-link-scan
```

Generated output stays under `.tmp/`, which is ignored by this package.
