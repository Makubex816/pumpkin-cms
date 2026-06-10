# Local-First Live-Readonly Behavior

Outbound Link Manager must work without live services.

## Local Sources

- fixture CMS content;
- tenant website bundles;
- import packages;
- standard backup bundles;
- local generated static output for future verification;
- fake scan fixtures.

## Local Rules

- No CMS/API calls.
- No external link crawling.
- No target URL health checks.
- No protected config reads.
- No write operations.
- Deterministic scan output.

## Live-Readonly Future Mode

Live-readonly discovery may be added under a later explicit approval. It may read approved CMS/API content snapshots or backup provider exports, but must not:

- write CMS content;
- mutate registry state without separate approval;
- crawl external destinations;
- read protected config;
- use keys/listKeys, connection strings, or SAS;
- deploy or publish.

## Mode Names

Suggested modes:

- `local-fixture`
- `tenant-bundle`
- `import-package`
- `backup-bundle`
- `live-readonly-cms-snapshot`

Write-capable modes require a separate future approval.
