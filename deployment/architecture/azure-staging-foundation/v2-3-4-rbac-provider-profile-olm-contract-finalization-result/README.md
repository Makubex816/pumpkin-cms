# V2.3.4 Staging RBAC, Provider Profile Binding, And OLM Contract Finalization Result

V2.3.4 finalized the staging RBAC/auth mode, identity/session type, provider profile candidate, Resource Registry candidate, and OLM staging environment contract after the V2.3.3 Azure staging foundation creation.

Status: complete, Cosmos data-plane RBAC assigned, provider profile candidate created, OLM contract validated, first write still blocked pending separate approval.

Created RBAC assignments:

- Cosmos DB Built-in Data Contributor at `/dbs/pumpkincms-olm-staging` for the signed-in operator session principal.
- Cosmos DB Built-in Data Contributor at `/dbs/pumpkincms-olm-staging` for managed identity `id-pumpkincms-olm-stg`.

Not performed:

- No OLM staging provider data write.
- No production resource change.
- No Storage RBAC assignment.
- No Key Vault data-plane role assignment.
- No protected config read.
- No keys/listKeys, connection strings, SAS, token, cookie, auth header, or secret export.

