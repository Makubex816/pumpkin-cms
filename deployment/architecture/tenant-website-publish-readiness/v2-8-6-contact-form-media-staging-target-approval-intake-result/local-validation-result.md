# Local Validation Result

Status: completed.

Commands run:

```text
git status --short
git log --oneline -15
git diff --cached --name-only
node --check deployment/static-azure/validate-static-output.mjs
node --check deployment/static-azure/validate-staging-package.mjs
npm run build:static:ice:sanitized
npm run validate:static:ice
npm run type-check
node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260612151525/repo/apps/ice-rink-web/out
node deployment/static-azure/validate-staging-package.mjs --site ice-rink-rentals --folder apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260612151525/repo/apps/ice-rink-web/out
npm run validate
npm run check
node src/runtime-qa-cli.mjs run --registry fixtures/runtime-qa-registry.v2-7-2.fixture.json --out .tmp/v2-8-6-runtime-qa-publish-gate-evidence --overwrite
node src/runtime-qa-cli.mjs validate-evidence --evidence .tmp/v2-8-6-runtime-qa-publish-gate-evidence
node src/resource-registry-cli.mjs validate-operational-bindings --fixture fixtures/operational-bindings.v2-5-1.fixture.json --out .tmp/v2-8-6-operational-bindings --overwrite
node src/outbound-link-cli.mjs provider-check --profile fixtures/provider-profile-olm-staging-cosmos-nosql.fixture.json --out .tmp/v2-8-6-provider-profile-check --overwrite
```

Expected non-zero commands:

- static output validator: non-zero because external form/backend gates are blocked
- staging package validator: non-zero because external form/backend gates are blocked

No command printed secret values.
