# Validation Summary

## Evidence And Target Review

| Check | Result |
| --- | --- |
| V2.8.16 planning packet | passed |
| V2.8.15 isolated staging signoff | passed |
| V2.8.14C isolated staging evidence | passed |
| V2.8.13 backend verification carryforward | passed |
| Production target metadata | passed |
| Production domain attachment metadata | passed |
| Token presence checks | passed, boolean-only |
| SWA CLI version | passed, `2.0.9` |

## Local Validation

| Command / check | Result |
| --- | --- |
| `npm run build:static:ice:sanitized` | passed, `sanitized_20260613014405` |
| `npm run validate:static:ice` | passed with `34` existing warnings |
| `npm run type-check` | passed |
| `node scripts/static-publish.mjs generate` | passed with `34` existing warnings |
| Static output validator | passed |
| Staging package validator | passed |
| Artifact root selection | passed |
| Artifact security scan | passed |
| Runtime QA harness check | passed, `6` tests |
| Runtime QA evidence run | `runtimeqa_b876ce99824cee8e` |
| Runtime QA evidence validation | passed with `1` warning |
| Resource Registry operational bindings | passed, `0` failures, `0` warnings |
| OLM check | passed, `132` tests |
| Static form endpoint check | passed |
| Static form endpoint tests | passed, `28` checks |

## Deployment And Verification

| Check | Result |
| --- | --- |
| Production deployment attempt | failed, exit code `1` |
| Attempt count | `1` |
| Broad retry | `false` |
| Production route checks | not run because deployment failed |

No DNS/custom-domain mutation, Search Console/indexing, contact form submission, POST, crawl, outbound URL check, CMS/provider write, Azure infrastructure creation, app settings mutation, RBAC assignment, protected config read, secret listing, keys/listKeys, connection string generation, or SAS generation occurred.

