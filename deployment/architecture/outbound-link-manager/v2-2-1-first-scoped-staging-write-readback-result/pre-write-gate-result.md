# Pre-Write Gate Result

Status: blocked before write.

| Gate | Result |
| --- | --- |
| V2.3.3 staging Azure foundation exists | passed |
| V2.3.4 RBAC/provider-profile/OLM contract package exists | passed |
| Approval manifest ID is `olapprove_508df3f03faa4f80` | passed |
| First-write batch ID is `olbatch_b08e184fdc6565aa` | passed |
| Expected record count is `48` | passed |
| Provider profile candidate is `olm-staging-cosmos-nosql-v1` | passed |
| Provider type is `azure-cosmos-nosql` | passed |
| Provider mode is `live-write-approved` and not `production-runtime` | passed |
| Target resource group/account/database are staging only | passed |
| 10 OLM containers exist with `/tenantKey` | passed |
| Cosmos RBAC assignments are listed at staging database scope | passed |
| OLM staging env contract validates | passed |
| Existing first-write package linkage validates | passed |
| Repo-supported live Cosmos write/readback executor exists | failed |
| No-go conditions are false | failed |

Blocking code: `LIVE_WRITE_APPROVED_UNAVAILABLE`.
