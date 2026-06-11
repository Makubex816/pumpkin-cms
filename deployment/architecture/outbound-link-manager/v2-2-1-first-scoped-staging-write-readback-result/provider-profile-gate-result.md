# Provider Profile Gate Result

Provider profile validation: passed.

| Field | Result |
| --- | --- |
| Provider profile ID | `olm-staging-cosmos-nosql-v1` |
| Provider type | `azure-cosmos-nosql` |
| Provider mode | `live-write-approved` |
| Production runtime selected | `false` |
| Secret values included | `false` |

Staging execution gate: blocked.

| Gate field | Result |
| --- | --- |
| Gate code | `LIVE_WRITE_APPROVED_UNAVAILABLE` |
| Live write allowed by repo executor | `false` |
| Production write allowed | `false` |

The block is intentional in the current repo code. The live profile can be validated locally, but the staging executor cannot perform the live Cosmos data-plane write.
