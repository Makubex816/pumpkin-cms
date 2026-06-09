# Backup Connector Implementation Backlog

## 1. Profile Resolver

Create a Backup Center profile resolver that selects:

- `local-dev`;
- `local-with-live-readonly`;
- `azure-readonly-backup`;
- `azure-export-approved`.

Output: profile report with allowed operations and presence-only env status.

## 2. Database Provider Discovery Connector

Inputs:

- process env presence only;
- approved non-secret API/provider endpoint if later implemented;
- safe app source defaults.

Output:

- selected provider: Cosmos DB, MongoDB, Azure SQL, or unknown;
- blocked reason when provider cannot be proven.

## 3. Cosmos Backup Connector

Mode A: read-only inventory/evidence.

Mode B: logical tenant export under separate approval.

Required:

- no keys in reports;
- checksums;
- tenant-scoped partition proof;
- restore-plan integration.

## 4. Azure SQL Connector

Keep optional until Azure SQL is proven as a source.

Modes:

- platform backup evidence;
- BACPAC export;
- `sqlpackage` local export.

Required:

- `sqlpackage` check;
- ignored output or private storage target;
- encryption/access-control proof.

## 5. Media Blob Connector

Modes:

- source discovery;
- metadata-to-blob map;
- blob inventory;
- blob local copy;
- private backup storage copy.

Required:

- identity-first access;
- no SAS values in reports;
- per-blob checksums;
- copy result report;
- restore verifier.

## 6. Tenant Bundle Writer

Writes structured site bundle metadata:

- `site-bundle-manifest.json`;
- `source-map.json`;
- `checksum-index.json`;
- status files for blocked components.

Must refuse to write binary artifacts into Git-tracked folders by default.

## 7. Validator Extensions

Add modes:

- baseline;
- source-wired;
- db-media-complete;
- production-restore-proof.

Production proof mode fails if DB and media binary proof are missing.

