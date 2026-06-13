# Validation Summary

Validation result: passed for local/forensic gates; blocked for corrective deployment auth.

| Check | Result |
| --- | --- |
| V2.8.17 root/package review | passed |
| Production target read-only reconfirmation | passed |
| Production domain read-only reconfirmation | passed, both `Ready` |
| `SWA_CLI_DEPLOYMENT_TOKEN` PowerShell presence | present, boolean only |
| `SWA_CLI_DEPLOYMENT_TOKEN` Node presence | present, boolean only |
| SWA CLI version | passed, `2.0.9` |
| Corrected SWA CLI dry-run | blocked, token invalid, no deployment |
| Sanitized static build | passed, `sanitized_20260613020714` |
| Static source validation | passed with `34` existing warnings |
| Type-check | passed |
| Static generation | passed with `34` existing warnings after Ice static env supplied |
| Static output validator | passed, 0 errors, 0 warnings after static-form env supplied |
| Staging package validator | passed, 0 errors, 0 warnings after static-form env supplied |
| Artifact root/security scan | passed |
| Runtime QA / Resource Registry / OLM | carried forward from V2.8.17; not rerun after auth dry-run blocked the retry |
| Corrective deployment | not attempted |
| Post-deploy route checks | not run |

Notes:

- Initial direct static-generate/validator invocations without required non-secret env context failed closed as expected and were rerun with explicit Ice static context.
- The corrected dry-run did not deploy and did not mutate Azure content.
- Generated `.tmp` artifacts remain ignored evidence and must not be staged.
