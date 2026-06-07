# Extension Schema and Migration Model

Extensions may introduce schema changes only through reviewed migrations.

Migration rules:

- declare from/to schema versions
- provide dry-run output
- provide rollback or forward-fix path
- run tests before production
- record affected tenants
- do not include secrets

Breaking schema changes require a migration guide and compatibility window.

