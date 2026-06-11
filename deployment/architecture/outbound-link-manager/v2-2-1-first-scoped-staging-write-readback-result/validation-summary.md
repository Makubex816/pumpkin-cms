# Validation Summary

Validation completed on 2026-06-11.

| Check | Result |
| --- | --- |
| Start-state checks | passed; worktree busy, no staged files |
| V2.3.3 package reviewed | passed |
| V2.3.4 package reviewed | passed |
| Active subscription display name | passed: `Azure subscription 1` |
| Staging resource group readback | passed |
| Cosmos account/database/container readback | passed |
| Container partition key check | passed: 10 containers use `/tenantKey` |
| Cosmos role assignment listing | passed: 2 assignments |
| Provider profile validation | passed |
| Provider staging execution gate | blocked: `LIVE_WRITE_APPROVED_UNAVAILABLE` |
| OLM staging env contract validation | passed |
| OLM staging env contract plus package linkage | passed |
| Existing first-write package validation | passed |
| Existing first-write package inspection | passed |
| Focused OLM staging tests | passed: 18 tests |

Final validation after file generation:

| Check | Result |
| --- | --- |
| Result manifest JSON parse | passed |
| `git diff --check` on touched paths | passed; only normal line-ending warnings from existing working copy behavior |
| Secret-like value scan on touched docs/package | passed; no matches |
| Subscription/operator ID redaction scan | passed; no raw subscription ID or operator principal ID fragments found |
| Protected/generated/raw artifact path guard | passed; touched paths are the V2.2.1 root report, platform control docs, and V2.2.1 result package |
| Staged-file check | passed; no files staged |

Safety confirmations:

- No protected config reads.
- No Key Vault secret queries.
- No keys/listKeys.
- No connection strings or SAS.
- No Azure infrastructure mutation.
- No RBAC assignment.
- No OLM staging provider write.
- No production DB migration or production write.
- No app deployment, indexing, or live publication.
