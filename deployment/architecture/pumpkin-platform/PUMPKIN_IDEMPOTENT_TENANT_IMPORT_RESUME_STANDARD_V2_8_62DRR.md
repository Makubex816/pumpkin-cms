# Pumpkin Idempotent Tenant Import Resume Standard V2.8.62DRR

## Rule

A resumed tenant import continues from verified persisted state. It never replays the whole package merely because a later object failed.

## Required Procedure

1. Authenticate without exposing credentials and capture tenant-scoped readback.
2. Classify each planned object as existing-matching, existing-drifted, completed, failed, or pending.
3. Stop on drift before mutation.
4. Preserve matching dependencies and create only absent objects.
5. Check absence immediately before each create.
6. Order operations by dependency and validate the exact API operation path for each stage.
7. Assign explicit attempt limits to non-idempotent retries.
8. Read back each write and compare exact identifiers, content holds, references, and counts.
9. Stop at the first failed response or readback mismatch.
10. Preserve partial state; destructive rollback, deletion, recreation, or direct repair requires separate approval.
11. Record both attempted and persisted counts.
12. Run broad runtime regression only after import completion gates pass.

DRR demonstrates the standard: 17 matching pages were preserved, one repaired contact retry occurred, 25 absent pages were created, and the run stopped at the first redirect readback mismatch without touching later metadata or unrelated tenants.
