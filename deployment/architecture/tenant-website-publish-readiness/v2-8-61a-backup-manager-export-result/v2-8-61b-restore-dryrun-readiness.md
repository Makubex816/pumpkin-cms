# V2.8.61B Restore Dry-Run Readiness

Status: ready for separate approval.

V2.8.61A produced the protected backup input required for a future restore dry-run.

Recommended V2.8.61B scope:

- Use the V2.8.61A protected bundle as read-only input.
- Validate checksums before any restore planning.
- Run local restore dry-run only.
- Do not mutate live tenants, users, pages, media, forms, themes, DomainBinding, appsettings, DNS, indexing, or storage.
- Do not use storage keys, listKeys, SAS, connection strings, Key Vault reads, or protected config outside a new approved secure handoff.
- Produce a restore plan and gap matrix before any live restore approval.
