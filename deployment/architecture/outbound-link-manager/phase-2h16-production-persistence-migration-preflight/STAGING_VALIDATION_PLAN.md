# Staging Validation Plan

Staging validation should precede production migration and live writes.

Staging stages:

1. Generate dry-run production records.
2. Validate schema and referential integrity.
3. Load records into staging-only provider if separately approved.
4. Run readback validation.
5. Run Admin runtime browser QA against staging profile.
6. Run Backup Center export from staging records.
7. Run rollback rehearsal.
8. Compare staging output with dry-run manifest.
9. Record owner/operator signoff.

Staging must use separate resources or provider namespaces from production live data.

Failure at any stage blocks production migration.
