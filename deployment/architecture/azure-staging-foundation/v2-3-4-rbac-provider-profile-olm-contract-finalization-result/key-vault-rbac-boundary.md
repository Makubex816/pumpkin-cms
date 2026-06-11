# Key Vault RBAC Boundary

No Key Vault RBAC assignments were created.

V2.3.4 does not require Key Vault secret reads, secret lists, or secret writes. The provider profile uses credential references only and the staging provider path uses Entra/RBAC for Cosmos.

Confirmed boundaries:

- no `az keyvault secret show`
- no `az keyvault secret list`
- no Key Vault secret value read
- no Key Vault secret role assignment

