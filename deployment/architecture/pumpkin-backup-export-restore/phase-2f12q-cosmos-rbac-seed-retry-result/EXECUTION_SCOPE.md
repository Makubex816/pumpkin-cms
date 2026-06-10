# Execution Scope

Approved:

- verify the current Azure principal with non-secret output
- list Cosmos native SQL role definitions
- assign the minimum required write-capable native Cosmos role to the approved principal
- scope the role to `pumpkin-prod-cms`
- rerun the existing guarded Ice seed runner
- write only approved Ice seed documents with `tenantKey = ice-rink-rentals`
- perform tenant-scoped readback verification

Not approved:

- keys/listKeys
- connection strings
- SAS generation
- protected config reads
- CMS runtime switch
- CMS writes
- MediaAsset writes
- database export
- Cosmos live document export
- media/blob download
- Azure resource creation beyond the approved role assignment
- Cosmos account/database/container changes
- broad subscription-level role changes
- deployment, indexing, or live-page publication
- staging generated `.tmp` artifacts
