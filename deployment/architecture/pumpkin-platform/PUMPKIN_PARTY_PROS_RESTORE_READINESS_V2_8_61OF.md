# Party Pros Restore Readiness V2.8.61OF

Status: restore seed created; live restore not approved.

The V2.8.61OF bundle includes:

- `restore/RESTORE_RUNBOOK.md`
- `MISSING_OR_NONRECOVERABLE_ITEMS.md`
- Database export JSON
- Media blob backup files and `media/media-manifest.json`
- Shared media resource map
- Source ZIP path/hash metadata
- Compiled package copy and manifest metadata
- Hardcopy folder path hash reference only

Missing or separately required for restore:

- SuperAdmin password and bearer tokens
- Tenant API key/API key hash values
- TenantAdmin password handoff
- Appsettings, Key Vault values, connection strings, storage keys, listKeys output, SAS tokens, and deployment tokens
- Any live media write authorization
- Any deploy/DNS/custom-domain approval

Next safe action is a no-mutation restore dry-run over the outside bundle. No live restore, deploy, DNS/custom-domain change, contact POST, form submission, customer-facing POST, Airstrip action, storage key/listKeys/SAS use, appsetting mutation, or Azure resource creation is approved by this document.
