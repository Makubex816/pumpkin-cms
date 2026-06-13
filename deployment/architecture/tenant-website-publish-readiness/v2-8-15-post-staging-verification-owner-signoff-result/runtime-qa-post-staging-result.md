# Runtime QA Post-Staging Result

Status: passed.

Commands run:

```text
npm run check
npm run run:v2-7-2
npm run validate:v2-7-2
```

Working directory:

```text
deployment/architecture/runtime-qa/platform-runtime-qa-harness
```

Results:

| Check | Result |
| --- | --- |
| Runtime QA package check | passed, 6 tests |
| Evidence run | `runtimeqa_9eec1c74e9e0890b` |
| Evidence validation | passed |
| Failures | `0` |
| Warnings | `1` |

Generated Runtime QA evidence remains under ignored `.tmp` output and is unstaged.
