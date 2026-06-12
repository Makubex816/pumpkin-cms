# Runtime QA Publish-Readiness Result

Status: passed.

Commands:

```text
npm run check
node src/runtime-qa-cli.mjs run --registry fixtures/runtime-qa-registry.v2-7-2.fixture.json --out .tmp/v2-8-3-runtime-qa-publish-readiness-evidence --overwrite
node src/runtime-qa-cli.mjs validate-evidence --evidence .tmp/v2-8-3-runtime-qa-publish-readiness-evidence
node src/runtime-qa-cli.mjs inspect-evidence --evidence .tmp/v2-8-3-runtime-qa-publish-readiness-evidence
```

Result:

| Field | Value |
| --- | --- |
| Check suite | 6 tests passed |
| Run ID | `runtimeqa_f1d3f440a58144b4` |
| Evidence status | passed |
| Phase in fixture | `V2.7.2` |
| Environment mode | `local-offline` |
| Provider profile | `olm-staging-cosmos-nosql-v1` |
| Checks | 15 |
| Blocked checks | 0 |
| Evidence validation | passed with 1 warning |

Generated evidence remains under ignored `.tmp`.

