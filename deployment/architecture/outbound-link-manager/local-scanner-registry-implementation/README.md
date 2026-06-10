# Outbound Link Manager Local Scanner And Store

Phase 2H-8 extends the local/offline Outbound Link Manager package with API-style response contracts, local read-only service methods, tenant/role guard simulation, blocked write-action guard stubs, and response validation.

This package scans fake fixture JSON only. It extracts outbound web URLs, normalizes them, builds tenant/site-scoped `outbound_links` records, builds per-placement `outbound_link_instances`, writes scan output, merges scan output into a local store, applies local policy, records local audit logs, validates the store, produces local render decisions, exports local integration artifacts, and exercises API-style read contracts under ignored `.tmp`.

It does not integrate with production renderers, crawl external links, call CMS/API/Azure services, write CMS data, run database migrations, implement Admin UI/API screens, deploy, index, or publish live pages.

## Quick Start

```powershell
npm run check
npm run scan:single
npm run scan:tenant-bundle
npm run validate:tenant-bundle
npm run inspect:tenant-bundle
npm run store:init
npm run store:merge
npm run store:validate
npm run store:inspect
npm run render:active
npm run render:validate
npm run integration:backup
npm run integration:tenant-bundle
```

## CLI

```powershell
node src/outbound-link-cli.mjs help
node src/outbound-link-cli.mjs scan --fixture fixtures/single-link.fixture.json --out .tmp/single-link-scan --overwrite
node src/outbound-link-cli.mjs validate --scan .tmp/single-link-scan
node src/outbound-link-cli.mjs inspect --scan .tmp/single-link-scan
node src/outbound-link-cli.mjs init-store --tenant fixture-tenant --site fixture-site --out .tmp/local-store --overwrite
node src/outbound-link-cli.mjs merge-scan --store .tmp/local-store --scan .tmp/tenant-bundle-scan --out .tmp/local-store-merged --overwrite
node src/outbound-link-cli.mjs set-link-status --store .tmp/local-store-merged --link-domain partner.example --status disabled --reason "local fixture test" --out .tmp/local-store-disabled --overwrite
node src/outbound-link-cli.mjs set-policy --store .tmp/local-store-merged --policy fixtures/policy-blocked-domain.fixture.json --out .tmp/local-store-policy --overwrite
node src/outbound-link-cli.mjs export-store --store .tmp/local-store-policy --out .tmp/local-store-export --overwrite
node src/outbound-link-cli.mjs validate-store --store .tmp/local-store-policy
node src/outbound-link-cli.mjs inspect-store --store .tmp/local-store-policy
node src/outbound-link-cli.mjs render-fixture --fixture fixtures/render-active-links.fixture.json --store .tmp/local-store-policy --out .tmp/render-active --overwrite
node src/outbound-link-cli.mjs validate-render --rendered .tmp/render-active
node src/outbound-link-cli.mjs inspect-render --rendered .tmp/render-active
node src/outbound-link-cli.mjs export-backup --store .tmp/local-store-policy --rendered .tmp/render-active --out .tmp/backup-center-export --overwrite
node src/outbound-link-cli.mjs validate-backup-export --export .tmp/backup-center-export
node src/outbound-link-cli.mjs export-tenant-bundle --store .tmp/local-store-policy --rendered .tmp/render-active --out .tmp/tenant-bundle-export --overwrite
node src/outbound-link-cli.mjs validate-tenant-bundle --bundle .tmp/tenant-bundle-export
node src/outbound-link-cli.mjs create-onboarding-import --store .tmp/local-store-policy --out .tmp/onboarding-import --overwrite
node src/outbound-link-cli.mjs validate-onboarding-import --import .tmp/onboarding-import
node src/outbound-link-cli.mjs simulate-restore-validation --export .tmp/backup-center-export --out .tmp/restore-validation --overwrite
node src/outbound-link-cli.mjs api-list-links --store .tmp/local-store-policy --tenant fixture-tenant --site fixture-site --out .tmp/api-list-links
node src/outbound-link-cli.mjs api-dashboard-summary --store .tmp/local-store-policy --tenant fixture-tenant --site fixture-site --out .tmp/api-dashboard-summary
node src/outbound-link-cli.mjs api-request-write --store .tmp/local-store-policy --action set-link-status --tenant fixture-tenant --site fixture-site --out .tmp/api-write-blocked
node src/outbound-link-cli.mjs validate-api-response --response .tmp/api-list-links
```

Generated output stays under `.tmp/`, which is ignored by this package.
