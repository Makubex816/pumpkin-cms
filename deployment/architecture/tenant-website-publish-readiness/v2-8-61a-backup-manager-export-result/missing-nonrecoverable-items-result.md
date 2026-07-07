# Missing Nonrecoverable Items Result

Status: completed.

The protected bundle includes:

`MISSING_OR_NONRECOVERABLE_ITEMS.md`

Excluded or nonrecoverable items include:

- SuperAdmin password and bearer token.
- Tenant API key and API key hash values.
- Appsettings, Key Vault values, connection strings, storage keys, SAS tokens, and deployment tokens.
- Live DNS/custom-domain execution state beyond DomainBinding and public metadata.
- Rebuilt runtime deployment artifact.
- Production BackupRun records, because the production model/API does not currently implement BackupRun persistence.
