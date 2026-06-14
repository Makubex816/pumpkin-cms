# Read-Only Safety Carryforward

Safety rules to carry into V2.9.11:

- Admin bridge remains GET-only;
- no mutation controls are introduced;
- current read-only banner remains visible in fixture and API modes;
- `readOnly: true` must be required on every envelope and data model;
- `securityBoundary.noWriteBoundarySatisfied` must be true;
- `securityBoundary.openFlags` must be empty;
- response metadata must keep writes, deployment, indexing, provider writes, CMS writes, external crawling, protected config reads, and secret export closed;
- `INDEXING_DEFERRED` warning remains visible;
- `google-indexing-deferred` next gate remains visible.

Adapter rejection conditions:

- missing or false read-only flags;
- unsupported provider mode;
- open write boundary;
- mismatched counts;
- missing Google indexing deferred state;
- enabled future actions.

The bridge should add no POST, PUT, PATCH, or DELETE call sites.

