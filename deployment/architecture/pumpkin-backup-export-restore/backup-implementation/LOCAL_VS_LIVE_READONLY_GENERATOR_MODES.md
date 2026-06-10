# Local Vs Live-Readonly Generator Modes

## `fake-complete`

`fake-complete` is offline and deterministic.

It may read:

- local fixture answers;
- fake CMS content fixtures;
- fake Cosmos records;
- fake media copy fixtures;
- redacted fixture config inventory;
- local Resource Registry readiness references.

It must not call Azure, CMS APIs, live storage, live Cosmos, Search Console, deployment surfaces, or protected config.

## `live-readonly`

`live-readonly` is the approved Ice proof mode. It may use:

- Azure AD/RBAC Cosmos data-plane read access;
- Azure AD/RBAC Storage Blob read access;
- previously approved tenant, container, and storage targets;
- local validation, checksum, restore-plan, and ZIP packaging code.

It must not use:

- keys/listKeys;
- connection strings;
- SAS values;
- protected config files;
- CMS writes;
- Cosmos writes;
- storage mutation;
- CMS runtime switching;
- deployment;
- indexing;
- live-page publication.

## Output Handling

Both modes write only under ignored `.tmp`. Generated bundles, restore reports, source proofs, and ZIPs are local artifacts and must not be staged into Git.
