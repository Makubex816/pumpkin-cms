# Media Storage Resource Inventory Plan

The registry should track media storage resources separately from CMS runtime database resources.

## Resource Types

- Media storage account
- Blob container
- CDN or media domain
- Media copy plan
- Media inventory artifact
- Media restore validation artifact

## Required Fields

- Storage provider
- Account/container non-secret identifier
- Tenant/site association
- Media domain association
- Access model
- Credential references
- Backup status
- Restore validation status
- Cleanup/retention notes

## Rules

- No storage keys in registry.
- No SAS values in registry.
- No blob downloads in registry planning.
- Media blob copy/download requires a later explicit approval.

## Backup Center Integration

Standard backups may include redacted media inventory and resource mapping. Actual media copies remain separately gated by approved backup execution.

