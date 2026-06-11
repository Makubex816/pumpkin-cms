# Key Vault Secret Boundary Plan

Key Vault is part of the future staging foundation as a secret reference boundary, not as a source of committed secret material.

## Allowed In Repo

- Vault name.
- Secret reference names.
- Identity labels.
- RBAC mode labels.
- Intended application/provider binding.
- Rotation owner and lifecycle notes.

## Never Allowed In Repo Or Logs

- Secret values.
- Azure access tokens.
- Refresh tokens.
- Session JWTs.
- Cookies.
- Auth headers.
- Cosmos keys.
- Storage keys.
- Connection strings.
- SAS values.
- Private keys.

## Future Secret Reference Model

| Reference | Purpose | Value storage |
| --- | --- | --- |
| `olm-staging-cosmos-endpoint` | Optional endpoint reference if not sourced from resource metadata | Key Vault value, not repo |
| `olm-staging-provider-client-id` | Optional managed identity or app identity reference | Key Vault or Azure identity metadata |
| `backup-center-staging-storage-ref` | Optional evidence storage reference | Key Vault value or managed identity binding |

## V2.3.1 Confirmation

No Key Vault was queried and no secret values were read. The Bicep draft enables RBAC-style vault access and does not output secret values.

