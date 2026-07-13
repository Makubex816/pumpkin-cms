# Pumpkin Shared Tenant Public Media Delivery Standard V2.8.62FR

## Standard

A public tenant preview may use anonymous Azure Blob reads only when access is limited to a tenant-scoped container at `blob` level. Known object URLs may be read; anonymous container enumeration must remain unavailable.

## Required Gates

1. Use Azure login/RBAC only. Do not use account keys, `listKeys`, connection strings, or SAS.
2. Verify the account already permits blob public access. Do not enable the account-wide setting as a tenant workaround.
3. Authenticate and reconcile every expected blob name, byte count, zero-byte result, and source alias before ACL mutation.
4. Change only the approved tenant container and require readback `blob`, never `container`.
5. Prove every canonical URL anonymously, reconcile bytes, and explicitly prove anonymous listing fails.
6. Do not duplicate media into an application deployment when immutable public blob URLs are the selected architecture.
7. A media-delivery pass is not media-rights, legal, indexing, DNS, or launch approval.

## Deployment Coupling

Shared-host deployment packages must inventory every pre-existing external tenant fixture and public asset before clean extraction. A tenant media pass does not permit regression of another tenant.
