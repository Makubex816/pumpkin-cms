# RBAC And Access Model

## Principles

- Least privilege.
- Separate provisioning from read/export.
- No keys/listKeys.
- No SAS generation.
- No connection strings in standard backup.
- Managed identity or Entra-based access preferred for live runtime and backup identities.

## Roles

| Role | Purpose | Allowed future actions |
| --- | --- | --- |
| Provisioning operator | Creates Cosmos resources after explicit approval | Azure mutation only during provisioning execution |
| App runtime identity | CMS runtime access to configured Cosmos data | Read/write CMS data as application requires |
| Backup read identity | Read-only provider metadata and later export access | Read metadata/documents only after export approval |
| Backup operator | Runs Backup Center workflows | Reads non-secret metadata, starts approved jobs |
| Security reviewer | Reviews redaction/audit output | Reads reports, not secrets |

## Required Evidence Before Execution

- role assignment plan;
- identity names as non-secret metadata;
- proof that key/listKeys/SAS access is not required;
- audit logging destination decision;
- separation between app runtime write capability and backup read/export capability.

## Hard Stop

Phase 2F-12E creates no role assignments and does not inspect live Azure RBAC.
