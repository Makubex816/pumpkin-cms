# Security Boundaries

## Standard Backup Boundary

Standard backup is non-secret by design. It can include operational evidence, redacted config inventory, and sensitive data classifications, but it must not contain secret values.

## Escrow Boundary

Escrow mode is elevated and encrypted. Escrow is never enabled by default and never rides along invisibly in standard backups, support packets, static output, or git artifacts.

## Public Directory Boundary

No backup zip, database export, escrow payload, decrypted escrow content, or sensitive media copy may be written to public/static directories.

## Logging Boundary

Logs can contain:

- job ID;
- actor;
- scope;
- mode;
- artifact ID;
- checksum;
- category names;
- status;
- error class.

Logs must not contain:

- secret values;
- decrypted escrow content;
- auth headers;
- cookies;
- tokens;
- connection strings;
- private keys.

## Git Boundary

Generated backup artifacts, escrow payloads, protected config, and raw content-review inputs must not be staged. Only architecture docs, schemas, and placeholder templates are allowed in Phase 2F-1.
