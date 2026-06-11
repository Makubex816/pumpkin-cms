# Staging Execution Package Builder

The Phase 2H-22 package builder assembles a local/offline approval package for a future first scoped staging-provider write.

Command:

```powershell
node src/outbound-link-cli.mjs build-staging-execution-package --source fixtures/execution-package-source.fixture.json --out .tmp/phase-2h22-staging-execution-package --overwrite
```

The builder generates local migration, apply-plan, staging-simulated execution, readback, provider capability, runtime QA reference, Resource Registry, Backup Center, rollback, readback, and approval evidence under ignored `.tmp`.

It does not perform a real staging-provider write, production database migration, CMS write, protected config read, Azure mutation, external crawl, deployment, indexing, or live-page publication.

