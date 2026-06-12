# Preflight Command Checklist

Allowed local/read-only checks used or recommended:

```text
npm run validate
npm run validate:static:ice
npm run check
node src/runtime-qa-cli.mjs run --registry fixtures/runtime-qa-registry.v2-7-2.fixture.json --out .tmp/v2-8-4-runtime-qa-worksheet-evidence --overwrite
node src/runtime-qa-cli.mjs validate-evidence --evidence .tmp/v2-8-4-runtime-qa-worksheet-evidence
node src/resource-registry-cli.mjs validate-operational-bindings --fixture fixtures/operational-bindings.v2-5-1.fixture.json --out .tmp/v2-8-4-operational-bindings --overwrite
node src/outbound-link-cli.mjs provider-check --profile fixtures/provider-profile-olm-staging-cosmos-nosql.fixture.json --out .tmp/v2-8-4-provider-profile-check --overwrite
```

Blocked until future approval or implementation:

- Next static build that auto-detects `.env.local`
- staging deployment command
- DNS mutation command
- Search Console/indexing command
- live publication command
- external crawl or live URL validation
- any command requiring keys/listKeys, connection strings, SAS, token export, or protected config

Future preflight must add a sanitized no-dotenv build command before staging execution can be approved.

