# Multi-Tenant Import Package Governance Implementation

Status: local no-write validator foundation.

This package validates synthetic tenant onboarding/import governance manifests. It does not create tenants, execute imports, write CMS/provider data, deploy, mutate DNS, submit forms, request indexing, read protected config, or contact live providers.

Commands:

```powershell
npm run check
npm test
node src/validate-import-package.mjs validate fixtures/valid-ice-carryforward.import-package.json
```

The validator is intentionally dependency-free and local-only.
