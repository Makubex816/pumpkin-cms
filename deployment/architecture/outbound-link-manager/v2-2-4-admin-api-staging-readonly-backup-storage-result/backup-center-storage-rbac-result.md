# Backup Center Storage RBAC Result

Status: passed with one narrow RBAC assignment.

Initial data-plane upload returned a Storage Blob permission error. The current Azure user principal, role, and scope were resolved explicitly.

Assignment created:

| Field | Value |
| --- | --- |
| Principal | current Azure user, redacted |
| Role | Storage Blob Data Contributor |
| Scope | `pumpkincmsstgolm01` / `backup-center-staging` container |
| Scope breadth | staging container only |

No subscription-wide role, Owner role, Contributor role, Key Vault role, storage key, connection string, or SAS was used.

After propagation, the proof upload succeeded.
