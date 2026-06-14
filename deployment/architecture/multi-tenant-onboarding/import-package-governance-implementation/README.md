# Multi-Tenant Import Package Governance Implementation

Status: local no-write validator, builder, and intake preview foundation.

This package validates synthetic tenant onboarding/import governance manifests, builds normalized package folders from safe source fixtures, and previews intake content. It does not create tenants, execute imports, write CMS/provider data, deploy, mutate DNS, submit forms, request indexing, read protected config, or contact live providers.

Commands:

```powershell
npm run check
npm test
node src/import-package-governance-cli.mjs validate fixtures/valid-ice-carryforward.fixture.json
node src/import-package-governance-cli.mjs build-package fixtures/valid-ice-carryforward.fixture.json --out .tmp/ice-carryforward-package
node src/import-package-governance-cli.mjs preview-package .tmp/ice-carryforward-package
```

Generated package output must stay under `.tmp/`, which is ignored by this package. The tooling rejects archive output paths and does not execute imports.

The implementation is intentionally dependency-free and local-only.
