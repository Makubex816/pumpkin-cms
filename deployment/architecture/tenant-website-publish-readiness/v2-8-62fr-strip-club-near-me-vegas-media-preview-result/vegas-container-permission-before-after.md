# Vegas Container Permission Before and After

| Property | Before | After |
| --- | --- | --- |
| Data-plane public access | unset | `blob` |
| ARM public access | `None` | `Blob` |
| ETag | `0x8DEDFA8106E2069` | `0x8DEE11EBAEB11EB` |
| Anonymous exact blob read | unavailable | available |
| Anonymous container listing | unavailable | unavailable |

The installed storage CLI rejected login-mode `set-permission` before mutation because that command version supports key auth only. The approved change was then made through the official ARM blob-container update API using the active Azure login/RBAC context. No key fallback was used.

The container remains at `blob`. Public media proof passed, the starter deployment succeeded, and the post-deployment failure policy disallows destructive reconciliation or a second deployment.
