# Config Inventory And Redaction

## Standard Config Inventory

Standard backups may include:

- required env var names;
- `PRESENT`, `MISSING`, `REDACTED`, or `NOT_APPLICABLE`;
- owning subsystem;
- restore impact if missing;
- whether value is escrow-eligible;
- source type, such as app setting, operator shell, or runtime secret store.

## Standard Inventory Must Not Include

- secret values;
- JWTs;
- API keys;
- auth headers;
- cookies;
- tokens;
- connection strings;
- storage keys;
- SAS URLs;
- protected config file contents;
- local machine paths.

## Escrow Boundary

Secret values are available only to recovery escrow mode after elevated approval and encryption. Support packets never include escrow payloads or escrow decrypted values.

## Path Safety

Backup Center validators must scan candidate artifacts and fail closed if they detect protected config paths, likely secret-bearing file names, unredacted assignments, auth headers, token-like values, or local credential/cache paths.

## Reports

Reports may show presence, missing state, category, and remediation instructions. Reports must not show values.
