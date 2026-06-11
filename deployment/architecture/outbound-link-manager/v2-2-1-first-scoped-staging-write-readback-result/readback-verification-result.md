# Readback Verification Result

Status: not run because the write was blocked before execution.

Readback expectations remain:

- read back all records written by `olbatch_b08e184fdc6565aa`
- verify record count `48`
- verify entity counts
- verify tenant/site scope
- verify `approvalManifestId`
- verify `firstWriteBatchId`
- verify `providerProfileId`
- verify trace continuity

No readback mismatch occurred because no records were written.
