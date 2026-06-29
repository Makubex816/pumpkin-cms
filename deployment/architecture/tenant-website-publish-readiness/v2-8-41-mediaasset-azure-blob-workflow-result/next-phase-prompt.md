# Next Phase Prompt

Approve V2.8.41A MediaAsset write-cleanup resolution only.

Scope:

- Preserve the V2.8.41 Azure Blob proof result and no-write boundaries.
- Do not upload a second proof blob unless explicitly approved for V2.8.41A.
- Resolve the MediaAsset live record proof gap by choosing one approved cleanup model:
  - add and deploy a source-supported hard cleanup route for disposable MediaAsset proof records, or
  - approve archive-as-cleanup with a documented residual-record policy and exact readback expectations.
- If a new blob proof is approved, capture direct public HTTP status before cleanup and do not retry after a sent upload.
- Continue excluding Themes, FormDefinitions, contact POSTs, page/content writes, publish/import writes, appsettings mutation, DNS/indexing, storage key-listing, delegated signed URLs, direct Cosmos mutation, Key Vault, and protected config reads.

Required output:

- A V2.8.41A result package that records the selected cleanup model, runtime proof, residual state, and security boundary.
