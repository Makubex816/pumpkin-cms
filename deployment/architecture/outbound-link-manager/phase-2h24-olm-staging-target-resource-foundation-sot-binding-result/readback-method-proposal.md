# Readback Method Proposal

Proposed method name:

```text
tenant-site-scoped-record-id-count-readback
```

Required behavior:

- Read only the approved staging provider target.
- Read only the approved tenant/site scope.
- Verify approval manifest `olapprove_508df3f03faa4f80`.
- Verify first-write batch `olbatch_b08e184fdc6565aa`.
- Verify expected records equal `48`, unless an approved variance is documented.
- Verify record IDs and entity counts per approved package.
- Verify tenant partition or tenant key behavior where the provider supports it.
- Produce readback evidence without secrets.

Current status: proposed, not executed.

This proposal supplies the future `OLM_STAGING_READBACK_METHOD` value only after operator/provider approval.

