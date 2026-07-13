# Idempotent Import Resume Standard Result

The DRR importer applied the durable resume rules:

1. Read and classify existing, completed, pending, and failed objects.
2. Compare existing objects to source-supported immutable input before writes.
3. Never recreate or overwrite completed dependencies without explicit reconciliation approval.
4. Check absence immediately before each create.
5. Use dependency order: pages, redirects, domain metadata, import audit, held publish audit.
6. Read back every write and stop at the first mismatch.
7. Preserve partial state and prohibit destructive rollback by default.
8. Record attempts separately from persisted readback state.

The standard worked as intended at the redirect failure: all completed pages were preserved, later stages were withheld, and no whole-import restart occurred.
