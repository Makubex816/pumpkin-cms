# DomainBinding Container Result

Status: passed.

Container:

- Name: `DomainBinding`
- Partition key: `/tenantId`

Result:

- The production API storage path ensures the container with `/tenantId`.
- Live DomainBinding create/readback succeeded for Airstrip.
- This proves the container exists or was created by the approved API storage path.

No storage keys, listKeys, SAS, connection string generation, or Key Vault secret reads were used.

