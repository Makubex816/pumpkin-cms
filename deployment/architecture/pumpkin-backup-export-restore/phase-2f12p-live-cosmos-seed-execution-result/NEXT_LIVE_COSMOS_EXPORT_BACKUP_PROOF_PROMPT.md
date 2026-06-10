# Next Live Cosmos Export Backup Proof Prompt

Before a live Cosmos export/backup proof can be attempted, approve a follow-up phase that grants or verifies Cosmos native RBAC data-plane access without keys/listKeys, connection strings, SAS, or protected config.

The next phase should:

- assign or verify Cosmos native RBAC for the approved operator/service principal using a separately approved Azure mutation
- rerun guarded live seed execution from the validated 12O seed package
- verify pre-write target state
- write only missing approved Ice seed documents
- perform tenant-scoped readback counts and sampled ID verification
- keep CMS runtime switch blocked unless separately approved
- keep live database export blocked until seed/readback passes
- avoid deployment, Search Console/indexing, and live-page publication

Do not proceed to live Cosmos export proof until live seed and readback verification pass.
