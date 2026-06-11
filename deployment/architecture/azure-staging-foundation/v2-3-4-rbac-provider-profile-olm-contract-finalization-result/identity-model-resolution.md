# Identity Model Resolution

Selected identity/session model:

```text
operator-azure-cli-session+managed-identity
```

Rationale:

- The current first-write reattempt is expected to be an operator-controlled local execution path, so the signed-in Azure CLI operator principal needs staging Cosmos data-plane access.
- The created managed identity `id-pumpkincms-olm-stg` is the durable app/provider identity candidate and also needs staging Cosmos data-plane access before future provider execution.
- Both principals are scoped only to the staging Cosmos database.

| Identity | Principal ID handling | RBAC result |
| --- | --- | --- |
| Operator Azure CLI session | redacted in committed docs | assigned |
| Managed identity `id-pumpkincms-olm-stg` | `f9e8a811-cd4f-4afb-9f39-9f2fece7e5e2` | assigned |

No UPN, token, cookie, auth header, credential cache, or protected config value was committed.

