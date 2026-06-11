# Outbound Link Manager Local Scanner And Store

Phase 2H-20 extends the local/offline Outbound Link Manager package with a staging-simulated persistence integration loop: provider profile validation, no-live-write gates, apply-plan dry-run output, staging-simulated execution under `.tmp`, readback verification, dry-run replay validation, provider state reporting, Resource Registry refresh candidates, Backup Center pre-execution checks, and rollback/audit/trace validation.

This package scans fake fixture JSON only. It extracts outbound web URLs, normalizes them, builds tenant/site-scoped `outbound_links` records, builds per-placement `outbound_link_instances`, writes scan output, merges scan output into a local store, applies local policy, records local audit logs, validates the store, produces local render decisions, exports local integration artifacts, exercises API-style read contracts, simulates future write actions against cloned sandbox stores under ignored `.tmp`, produces API-style local/fake write preflight responses, generates production-shaped migration dry-run candidates, converts those candidates into provider-shaped apply-plan dry-run records, and executes those records into a local staging-simulated provider store without live writes.

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
node src/outbound-link-cli.mjs simulate-action --store .tmp/local-store-policy --request fixtures/action-approve-review.fixture.json --out .tmp/action-approve-review --overwrite
node src/outbound-link-cli.mjs validate-action-result --result .tmp/action-approve-review
node src/outbound-link-cli.mjs api-write-preflight --store .tmp/local-store-policy --request fixtures/api-write-preflight-approve-review.fixture.json --out .tmp/api-write-preflight-approve-review --overwrite
node src/outbound-link-cli.mjs validate-api-write-preflight --result .tmp/api-write-preflight-approve-review
node src/outbound-link-cli.mjs migration-dry-run --store .tmp/local-store-policy --profile fixtures/migration-production-provider-profile.fixture.json --out .tmp/phase-2h17-migration-dry-run --overwrite
node src/outbound-link-cli.mjs validate-migration-dry-run --migration .tmp/phase-2h17-migration-dry-run
node src/outbound-link-cli.mjs inspect-migration-dry-run --migration .tmp/phase-2h17-migration-dry-run
node src/outbound-link-cli.mjs provider-check --profile fixtures/provider-profile-staging-simulated.fixture.json --out .tmp/phase-2h19-staging-provider/provider-check
node src/outbound-link-cli.mjs apply-plan-dry-run --migration .tmp/phase-2h17-migration-dry-run --profile fixtures/provider-profile-staging-simulated.fixture.json --out .tmp/phase-2h19-staging-provider/apply-plan --overwrite
node src/outbound-link-cli.mjs validate-apply-plan --apply-plan .tmp/phase-2h19-staging-provider/apply-plan
node src/outbound-link-cli.mjs inspect-apply-plan --apply-plan .tmp/phase-2h19-staging-provider/apply-plan
node src/outbound-link-cli.mjs staging-execute --apply-plan .tmp/phase-2h20-staging-persistence-integration/apply-plan-refresh --profile fixtures/staging-execution-profile.fixture.json --out .tmp/phase-2h20-staging-persistence-integration/execution --overwrite
node src/outbound-link-cli.mjs staging-readback --execution .tmp/phase-2h20-staging-persistence-integration/execution --out .tmp/phase-2h20-staging-persistence-integration/readback
node src/outbound-link-cli.mjs validate-staging-execution --execution .tmp/phase-2h20-staging-persistence-integration/execution
node src/outbound-link-cli.mjs api-provider-state --execution .tmp/phase-2h20-staging-persistence-integration/execution --tenant fixture-tenant --site fixture-site --out .tmp/phase-2h20-staging-persistence-integration/api-provider-state
```

Generated output stays under `.tmp/`, which is ignored by this package.
