# Production Readback Plan

Plan ID: `olprodread_2h25_preflight`.

Required future readback after approved migration execution:

1. Read all migrated OLM records by tenantKey, siteKey, entity, and migrationRunId.
2. Confirm total record count is `48`.
3. Confirm entity counts match the candidate matrix.
4. Confirm provider profile and production target match the approval manifest.
5. Confirm no extra records were created outside the approved entity mapping.
6. Compare readback hashes/checksums with migration dry-run evidence.
7. Stop and report variance if any count, ID, tenant/site, or hash mismatch appears.

No production readback was run in Phase 2H-25 because no production target/session was approved.
