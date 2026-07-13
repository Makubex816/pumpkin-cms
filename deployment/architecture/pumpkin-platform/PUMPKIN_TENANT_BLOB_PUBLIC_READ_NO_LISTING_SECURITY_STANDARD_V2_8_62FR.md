# Pumpkin Tenant Blob Public Read, No-Listing Security Standard V2.8.62FR

## Allowed State

- Storage account policy already allows public blob access.
- One approved tenant container has public access `blob`.
- Anonymous clients can retrieve an exact known blob URL.
- Anonymous container listing does not return an enumeration.

## Prohibited State

- Container access `container`.
- Account-wide policy mutation to bypass a tenant-level gate.
- Key, `listKeys`, connection-string, or SAS fallback.
- Cross-tenant container changes.
- Blob upload, overwrite, copy, rename, or delete during an ACL-only phase.

## Evidence

Record before/after ACL state, ETags, exact resource ID, account policy readback, all-object status and bytes, content types, alias reconciliation, denied listing status, and Azure activity-log scope. Never record secret values.

If listing succeeds or any required blob remains unreadable before deployment, restore the prior ACL. If deployment succeeds and a later application fidelity gate fails, follow the approved post-deployment failure policy and do not improvise destructive rollback.
