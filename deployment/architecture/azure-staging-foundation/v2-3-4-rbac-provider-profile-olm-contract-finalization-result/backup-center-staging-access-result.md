# Backup Center Staging Access Result

Backup Center staging resources remain available from V2.3.3:

- storage account `pumpkincmsstgolm01`
- container `backup-center-staging`
- container `resource-registry-staging`

No Storage Blob RBAC assignment was created in V2.3.4. This is not a blocker for the Cosmos first-write contract, but it remains a hardening item before using staging blob evidence writes.

